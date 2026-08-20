"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGPUTier } from "@/hooks/useGPUTier";
import { cn } from "@/lib/utils";
import type { SignatureVariant } from "./signature-spec";
import { SIGNATURE_SPEC } from "./signature-spec";
import styles from "./SignatureScene.module.css";

const SignatureLattice = dynamic(
  () => import("./SignatureLattice").then((m) => ({ default: m.SignatureLattice })),
  { ssr: false }
);

/**
 * The site's one piece of 3D, used at three scales: the home hero, every
 * case-study dossier header, and the Lab header. Before this there were two
 * bespoke scenes (a particle hero, an Aarchid-only plant) plus a third that
 * nothing rendered, so the effect read as an accident rather than an identity.
 *
 * Colour comes from the live value of `--accent`, re-read whenever the theme
 * mode or palette changes, so the scene follows all four palette swaps and
 * both themes instead of hard-coding two hexes.
 *
 * Anyone who does not get the canvas - reduced motion, no usable GPU, or a
 * narrow viewport where it would only cost battery - gets the same figure
 * drawn as a static SVG.
 */

const FALLBACK_MIN_WIDTH = 768;

/** Re-read whenever useTheme flips data-theme or data-palette on <html>. */
function subscribeToThemeAttributes(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-palette"],
  });
  return () => observer.disconnect();
}

function readAccentHex(): number | null {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  if (!raw) return null;
  // Written as #rrggbb in tokens.css; parseInt keeps this dependency-free.
  const parsed = Number.parseInt(raw.replace("#", ""), 16);
  return Number.isNaN(parsed) ? null : parsed;
}

function useAccentHex(): number | null {
  return useSyncExternalStore(subscribeToThemeAttributes, readAccentHex, () => null);
}

function useIsWideViewport(): boolean {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${FALLBACK_MIN_WIDTH}px)`);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return wide;
}

/** The lattice as flat geometry, for everyone the canvas is not right for. */
function SignatureFallback({ variant }: { variant: SignatureVariant }) {
  const spec = SIGNATURE_SPEC[variant];
  const r = 40;
  const ring = r * spec.ringScale;
  const rings = [r, r * 0.66, r * 0.33];

  return (
    <svg
      className={styles.fallback}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <g
        transform="translate(100 100)"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.6"
        opacity={spec.opacity}
      >
        {rings.map((radius) => (
          <circle key={radius} r={radius} />
        ))}
        <ellipse rx={r} ry={r * 0.34} />
        <ellipse rx={r * 0.34} ry={r} />
        <ellipse
          rx={ring}
          ry={ring * 0.3}
          opacity={0.55}
          transform="rotate(-18)"
        />
        <line x1={-r} y1="0" x2={r} y2="0" />
        <line x1="0" y1={-r} x2="0" y2={r} />
      </g>
    </svg>
  );
}

interface SignatureSceneProps {
  variant: SignatureVariant;
  /** Adds the pointer parallax. Only the home hero earns it. */
  interactive?: boolean;
  className?: string;
}

export function SignatureScene({
  variant,
  interactive = false,
  className,
}: SignatureSceneProps) {
  const prefersReduced = useReducedMotion();
  const gpuTier = useGPUTier();
  const isWide = useIsWideViewport();
  const accentHex = useAccentHex();

  const canRender =
    !prefersReduced && gpuTier !== "fallback" && isWide && accentHex !== null;

  return (
    <div
      className={cn(styles.stage, styles[variant], className)}
      aria-hidden="true"
    >
      {canRender ? (
        <SignatureLattice
          variant={variant}
          colorHex={accentHex}
          interactive={interactive}
        />
      ) : (
        <SignatureFallback variant={variant} />
      )}
    </div>
  );
}
