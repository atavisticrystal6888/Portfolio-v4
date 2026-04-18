"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./ARViewer.module.css";

interface ARViewerProps {
  caseStudySlug: string;
  fallbackDiagram?: React.ReactNode;
}

/**
 * Progressive enhancement AR/VR entry point.
 * - Detects WebXR support (`navigator.xr`)
 * - Shows "Explore in 3D" CTA only when an immersive session is available
 * - Falls back to the provided diagram on unsupported devices
 *
 * Full immersive scene rendering is intentionally deferred; the actual
 * AR session opens in a dynamically-loaded module to keep the main
 * bundle untouched on devices that would never use it.
 */
export function ARViewer({ caseStudySlug, fallbackDiagram }: ARViewerProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const xr = (navigator as Navigator & { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } }).xr;
    if (!xr || typeof xr.isSessionSupported !== "function") {
      setSupported(false);
      return;
    }
    xr.isSessionSupported("immersive-ar")
      .then((ok) => {
        if (!cancelled) setSupported(ok);
      })
      .catch(() => {
        if (!cancelled) setSupported(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      // Lazy import keeps Three.js XR code out of the main bundle
      const mod = await import("./ARScene").catch(() => null);
      if (mod && typeof mod.launchARSession === "function") {
        await mod.launchARSession(caseStudySlug);
      }
    } finally {
      setLaunching(false);
    }
  };

  // Still detecting → render nothing to avoid layout shift
  if (supported === null) return null;

  if (!supported) {
    if (!fallbackDiagram) return null;
    return (
      <section aria-label="Architecture diagram" className={styles.wrapper}>
        <GlassCard className={styles.fallback}>{fallbackDiagram}</GlassCard>
      </section>
    );
  }

  return (
    <section aria-label="Explore in AR" className={styles.wrapper}>
      <GlassCard className={styles.cta}>
        <h3 className={styles.heading}>Explore in 3D</h3>
        <p className={styles.desc}>
          Your device supports WebXR. Launch an immersive view of this
          project&apos;s architecture.
        </p>
        <Button
          onClick={handleLaunch}
          disabled={launching}
          aria-label="Launch AR session"
        >
          {launching ? "Launching…" : "Launch AR Session"}
        </Button>
      </GlassCard>
    </section>
  );
}
