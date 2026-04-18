const GITHUB_USERNAME = "singhaldhruv";
const API_BASE = "https://api.github.com";
const REVALIDATE = 3600; // 1 hour ISR

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

export interface RepoSummary {
  name: string;
  description: string;
  language: string;
  stars: number;
  updatedAt: string;
  url: string;
}

export interface GitHubData {
  repos: RepoSummary[];
  recentCommitDays: number[];
}

const headers: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "portfolio-next",
};

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getGitHubData(): Promise<GitHubData> {
  const empty: GitHubData = { repos: [], recentCommitDays: [] };

  const repos = await fetchJSON<GitHubRepo[]>(
    `${API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`
  );

  if (!repos) return empty;

  const repoSummaries: RepoSummary[] = repos.map((r) => ({
    name: r.name,
    description: r.description || "",
    language: r.language || "Unknown",
    stars: r.stargazers_count,
    updatedAt: r.updated_at,
    url: r.html_url,
  }));

  // Simple heatmap: count days with events in last 30 days
  const events = await fetchJSON<Array<{ created_at: string }>>(
    `${API_BASE}/users/${GITHUB_USERNAME}/events/public?per_page=100`
  );

  const commitDays: number[] = new Array(30).fill(0);
  if (events) {
    const now = Date.now();
    for (const ev of events) {
      const daysAgo = Math.floor((now - new Date(ev.created_at).getTime()) / 86400000);
      if (daysAgo >= 0 && daysAgo < 30) {
        commitDays[daysAgo]!++;
      }
    }
  }

  return { repos: repoSummaries, recentCommitDays: commitDays };
}
