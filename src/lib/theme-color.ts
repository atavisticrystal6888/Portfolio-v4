import type { ThemeMode } from "@/types/theme";

/* Browser-chrome colour (`<meta name="theme-color">`) for each rendered mode.
   Mirrors --bg in src/styles/tokens.css. The meta follows the theme the page
   actually renders, never the OS preference: the inline script in
   src/app/layout.tsx sets it before first paint from the stored choice, and
   applyTheme() in src/hooks/useTheme.ts keeps it in step on every toggle. */
export const THEME_COLOR: Record<ThemeMode, string> = {
  light: "#f6f5f1",
  dark: "#0d1322",
};
