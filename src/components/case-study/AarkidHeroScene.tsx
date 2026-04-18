"use client";

import dynamic from "next/dynamic";
import { useIntersection } from "@/hooks/useIntersection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGPUTier } from "@/hooks/useGPUTier";
import styles from "./AarkidScene.module.css";

const AarkidScene = dynamic(
  () => import("./AarkidScene").then((m) => m.AarkidScene),
  {
    ssr: false,
    loading: () => <PlantSilhouette />,
  }
);

/** Pure-SVG fallback: graceful degradation for SSR, reduced-motion, and low-tier GPUs. */
function PlantSilhouette() {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="220" rx="60" ry="8" fill="var(--accent)" opacity="0.15" />
        <path
          d="M70 200 L60 230 L140 230 L130 200 Z"
          fill="var(--text-muted)"
          opacity="0.35"
        />
        <rect x="98" y="100" width="4" height="100" fill="var(--accent)" opacity="0.4" />
        <ellipse cx="100" cy="80" rx="50" ry="70" fill="var(--accent)" opacity="0.2" />
        <ellipse
          cx="70"
          cy="100"
          rx="30"
          ry="55"
          fill="var(--accent)"
          opacity="0.25"
          transform="rotate(-25 70 100)"
        />
        <ellipse
          cx="130"
          cy="100"
          rx="30"
          ry="55"
          fill="var(--accent)"
          opacity="0.25"
          transform="rotate(25 130 100)"
        />
      </svg>
    </div>
  );
}

export function AarkidHeroScene() {
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>({
    threshold: 0.05,
    rootMargin: "200px",
  });
  const prefersReduced = useReducedMotion();
  const gpuTier = useGPUTier();

  // Always render the SVG fallback for low-tier or reduced-motion users.
  if (prefersReduced || gpuTier === "fallback") {
    return <PlantSilhouette />;
  }

  // Defer the heavy import until the hero is near the viewport.
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      {isIntersecting ? <AarkidScene active={isIntersecting} /> : <PlantSilhouette />}
    </div>
  );
}
