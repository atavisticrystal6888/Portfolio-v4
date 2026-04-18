export type ThemeMode = "dark" | "light";
export type PaletteName = "teal" | "ocean" | "emerald" | "amber" | "mono";

export interface ThemeConfig {
  mode: ThemeMode;
  palette: PaletteName;
}

export interface UserBehavior {
  pagesVisited: { slug: string; timestamp: number }[];
  categoryAffinities: Record<string, number>;
  sectionScrollDepths: Record<string, number>;
  sessionCount: number;
  firstVisit: number;
  lastVisit: number;
}
