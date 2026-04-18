"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { PaletteName, ThemeConfig } from "@/types/theme";

const STORAGE_KEY = "ds-portfolio-theme";

const DEFAULT_CONFIG: ThemeConfig = {
  mode: "dark",
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
  // Fall back to system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return { ...DEFAULT_CONFIG, mode: prefersDark ? "dark" : "light" };
}

function applyTheme(config: ThemeConfig) {
  const html = document.documentElement;
  html.setAttribute("data-theme", config.mode);
  html.setAttribute("data-palette", config.palette);
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

/**
 * Inline script to prevent FOUC. Insert in <head> via dangerouslySetInnerHTML.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var config = stored ? JSON.parse(stored) : null;
    var mode = config ? config.mode : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var palette = config ? config.palette : 'teal';
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-palette', palette);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-palette', 'teal');
  }
})();
`;
