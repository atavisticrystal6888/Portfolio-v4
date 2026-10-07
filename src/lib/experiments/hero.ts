/** The one experiment this site runs today, and the copy each arm shows. */
export const HERO_CTA_EXPERIMENT = "portfolio-hero-cta";
export const HERO_CTA_EVENT = "hero_cta_click";

export const HERO_CTA_VARIANTS = ["control", "read-the-case-studies"] as const;
export type HeroCtaVariant = (typeof HERO_CTA_VARIANTS)[number];

export const HERO_CTA_COPY: Record<HeroCtaVariant, string> = {
  control: "See the work",
  "read-the-case-studies": "Read the case studies",
};

function isHeroCtaVariant(value: string | undefined): value is HeroCtaVariant {
  return value !== undefined && (HERO_CTA_VARIANTS as readonly string[]).includes(value);
}

/** Unknown keys (a variant renamed on the server) render control, never an empty button. */
export function heroCtaCopy(variantKey: string | undefined): string {
  return isHeroCtaVariant(variantKey) ? HERO_CTA_COPY[variantKey] : HERO_CTA_COPY.control;
}
