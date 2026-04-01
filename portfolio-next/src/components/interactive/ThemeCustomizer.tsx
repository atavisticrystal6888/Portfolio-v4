"use client";

import { useTheme } from "@/hooks/useTheme";
import type { PaletteName } from "@/types/theme";
import styles from "./ThemeCustomizer.module.css";
import { cn } from "@/lib/utils";

const PALETTES: { name: PaletteName; label: string; color: string }[] = [
  { name: "teal", label: "Teal", color: "#5ba4b5" },
  { name: "ocean", label: "Ocean", color: "#4a90d9" },
  { name: "emerald", label: "Emerald", color: "#34d399" },
  { name: "amber", label: "Amber", color: "#f59e0b" },
  { name: "mono", label: "Mono", color: "#a1a1aa" },
];

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { palette, setPalette, mode, toggleMode } = useTheme();

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel} role="dialog" aria-label="Theme customizer">
        <div className={styles.header}>
          <h3 className={styles.title}>Customize Theme</h3>
          <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Mode</span>
          <div className={styles.modeToggle}>
            <button className={cn(styles.modeBtn, mode === "dark" && styles.modeActive)} onClick={() => { if (mode !== "dark") toggleMode(); }}>Dark</button>
            <button className={cn(styles.modeBtn, mode === "light" && styles.modeActive)} onClick={() => { if (mode !== "light") toggleMode(); }}>Light</button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Accent Color</span>
          <div className={styles.swatches}>
            {PALETTES.map((p) => (
              <button
                key={p.name}
                className={cn(styles.swatch, palette === p.name && styles.swatchActive)}
                style={{ "--swatch-color": p.color } as React.CSSProperties}
                onClick={() => setPalette(p.name)}
                aria-label={`Set accent to ${p.label}`}
                title={p.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
