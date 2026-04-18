"use client";

import dynamic from "next/dynamic";

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
  return (
    <>
      <ThreeHero />
      <ParticlesBg />
    </>
  );
}
