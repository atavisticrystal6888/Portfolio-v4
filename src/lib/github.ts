import type { GitHubProfile, PinnedRepo } from "@/types/github";

const GITHUB_API = "https://api.github.com/graphql";
const CACHE_REVALIDATE = 3600; // 1 hour ISR

interface GraphQLResponse {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: Array<{
          name: string;
          description: string | null;
          url: string;
          primaryLanguage: { name: string } | null;
          stargazerCount: number;
          forkCount: number;
        }>;
      };
      contributionsCollection?: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
      repositories?: {
        totalCount: number;
        nodes?: Array<{
          primaryLanguage: { name: string } | null;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const QUERY = `
  query($username: String!) {
    user(login: $username) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            primaryLanguage { name }
            stargazerCount
            forkCount
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: { field: UPDATED_AT, direction: DESC }) {
        totalCount
        nodes {
          primaryLanguage { name }
        }
      }
    }
  }
`;

// Slug mapping: GitHub repo name → portfolio project slug
const REPO_SLUG_MAP: Record<string, string> = {
  aarkid: "aarkid",
  "churn-analysis": "churn-analysis",
  "marketing-effectiveness": "marketing-effectiveness",
  portfolio: "portfolio-site",
};

function calculateStreak(
  weeks: GitHubProfile["contributionCalendar"]["weeks"]
): number {
  const days = weeks.flatMap((w) => w.contributionDays).reverse();
  let streak = 0;
  // Skip today if no contributions yet
  const startIdx = days[0]?.contributionCount === 0 ? 1 : 0;
  for (let i = startIdx; i < days.length; i++) {
    if ((days[i]?.contributionCount ?? 0) > 0) streak++;
    else break;
  }
  return streak;
}

function calculateTopLanguages(
  repos: Array<{ primaryLanguage: { name: string } | null }>
): { name: string; percentage: number }[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const repo of repos) {
    if (repo.primaryLanguage?.name) {
      counts[repo.primaryLanguage.name] =
        (counts[repo.primaryLanguage.name] ?? 0) + 1;
      total++;
    }
  }
  if (total === 0) return [];
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100),
    }));
}

/** Fallback data when GitHub API is unavailable */
function getFallbackProfile(username: string): GitHubProfile {
  return {
    username,
    pinnedRepos: [],
    contributionCalendar: { totalContributions: 0, weeks: [] },
    totalContributions: 0,
    topLanguages: [],
    currentStreak: 0,
    totalPublicRepos: 0,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getGitHubProfile(): Promise<GitHubProfile> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    console.warn("GitHub integration: GITHUB_TOKEN or GITHUB_USERNAME not set");
    return getFallbackProfile(username || "unknown");
  }

  try {
    const res = await fetch(GITHUB_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: CACHE_REVALIDATE },
    });

    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}`);
      return getFallbackProfile(username);
    }

    const json = (await res.json()) as GraphQLResponse;

    if (json.errors?.length) {
      console.warn("GitHub GraphQL errors:", json.errors);
      return getFallbackProfile(username);
    }

    const user = json.data?.user;
    if (!user) return getFallbackProfile(username);

    const pinnedRepos: PinnedRepo[] = (
      user.pinnedItems?.nodes ?? []
    ).map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      primaryLanguage: repo.primaryLanguage?.name ?? null,
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      matchedProjectSlug:
        REPO_SLUG_MAP[repo.name.toLowerCase()] ?? null,
    }));

    const calendar =
      user.contributionsCollection?.contributionCalendar ?? {
        totalContributions: 0,
        weeks: [],
      };

    const repoNodes = user.repositories?.nodes ?? [];

    return {
      username,
      pinnedRepos,
      contributionCalendar: calendar,
      totalContributions: calendar.totalContributions,
      topLanguages: calculateTopLanguages(repoNodes),
      currentStreak: calculateStreak(calendar.weeks),
      totalPublicRepos: user.repositories?.totalCount ?? 0,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("GitHub fetch failed:", err);
    return getFallbackProfile(username);
  }
}
