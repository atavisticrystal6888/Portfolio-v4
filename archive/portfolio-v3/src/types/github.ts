export interface PinnedRepo {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: string | null;
  stargazerCount: number;
  forkCount: number;
  matchedProjectSlug: string | null;
}

export interface GitHubProfile {
  username: string;
  pinnedRepos: PinnedRepo[];
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
  totalContributions: number;
  topLanguages: { name: string; percentage: number }[];
  currentStreak: number;
  totalPublicRepos: number;
  fetchedAt: string;
}
