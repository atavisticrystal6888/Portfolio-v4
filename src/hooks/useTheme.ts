"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";
import type { PaletteName, ThemeConfig, ThemeMode } from "@/types/theme";
import { THEME_COLOR } from "@/lib/theme-color";

const STORAGE_KEY = "ds-portfolio-theme";

/* The working-paper light theme IS the site's identity, so first-time
   visitors get it regardless of OS preference; the toggle persists any
   explicit choice. */
const DEFAULT_CONFIG: ThemeConfig = {
  mode: "light",
  palette: "teal",
};

function getInitialConfig(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ThemeConfig;
  } catch {
    // localStorage unavailable or corrupt
  }
  return DEFAULT_CONFIG;
}

/* Browser chrome follows the rendered theme. The inline script in
   src/app/layout.tsx creates this meta before first paint; it is recreated
   here if anything removed it since (a client re-render of <head> after a
   hydration error drops nodes React did not render). */
function syncThemeColor(mode: ThemeMode) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", THEME_COLOR[mode] ?? THEME_COLOR.light);
}

function applyTheme(config: ThemeConfig) {
  const html = document.documentElement;
  html.setAttribute("data-theme", config.mode);
  html.setAttribute("data-palette", config.palette);
  syncThemeColor(config.mode);
}

// Module-level external store
let currentConfig: ThemeConfig = (() => {
  const config = getInitialConfig();
  if (typeof document !== "undefined") applyTheme(config);
  return config;
})();

const themeListeners = new Set<() => void>();

function subscribe(callback: () => void) {
  themeListeners.add(callback);
  return () => { themeListeners.delete(callback); };
}

function getSnapshot(): ThemeConfig {
  return currentConfig;
}

function getServerSnapshot(): ThemeConfig {
  return DEFAULT_CONFIG;
}

function emitChange() {
  themeListeners.forEach((l) => l());
}

function setThemeConfig(next: ThemeConfig) {
  currentConfig = next;
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage full or disabled
  }
  emitChange();
}

export function useTheme() {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Re-assert after mount and on every mode change, so the meta survives
  // anything that rebuilt <head> after the inline script ran.
  useEffect(() => {
    syncThemeColor(config.mode);
  }, [config.mode]);

  const toggleMode = useCallback(() => {
    setThemeConfig({
      ...currentConfig,
      mode: currentConfig.mode === "dark" ? "light" : "dark",
    });
  }, []);

  const setPalette = useCallback(
    (palette: PaletteName) => {
      setThemeConfig({ ...currentConfig, palette });
    },
    []
  );

  return {
    mode: config.mode,
    palette: config.palette,
    toggleMode,
    setPalette,
  };
}
