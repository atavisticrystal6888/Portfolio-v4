"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ThreeHero = dynamic(
  () =>
    import("@/components/interactive/ThreeHero").then((m) => ({
      default: m.ThreeHero,
    })),
  { ssr: false }
);

const ParticlesBg = dynamic(
  () =>
    import("@/components/interactive/ParticlesBg").then((m) => ({
      default: m.ParticlesBg,
    })),
  { ssr: false }
);

export function HeroVisuals() {
  // Mount the heavy visual chunks after the browser is idle so they never
  // compete with hydration - early taps stay responsive on slower devices.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), {
        timeout: 1500,
      });
      return () => window.cancelIdleCallback(id);
    }
    // No requestIdleCallback (older WebKit): approximate the same
    // "after hydration settles" window with a fixed delay.
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  return (
    <>
      <ThreeHero />
      <ParticlesBg />
    </>
  );
}
