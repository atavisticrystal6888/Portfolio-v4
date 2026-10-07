import { describe, expect, it } from "vitest";
import { HERO_CTA_COPY, HERO_CTA_EVENT, HERO_CTA_EXPERIMENT, HERO_CTA_VARIANTS, heroCtaCopy } from "@/lib/experiments/hero";

describe("hero CTA experiment", () => {
  it("names the experiment, event and variants", () => {
    expect(HERO_CTA_EXPERIMENT).toBe("portfolio-hero-cta");
    expect(HERO_CTA_EVENT).toBe("hero_cta_click");
    expect(HERO_CTA_VARIANTS).toEqual(["control", "read-the-case-studies"]);
  });

  it("maps every variant to copy", () => {
    expect(HERO_CTA_COPY.control).toBe("See the work");
    expect(HERO_CTA_COPY["read-the-case-studies"]).toBe("Read the case studies");
  });

  it("falls back to control copy for unknown or missing variants", () => {
    expect(heroCtaCopy(undefined)).toBe("See the work");
    expect(heroCtaCopy("renamed-on-server")).toBe("See the work");
    expect(heroCtaCopy("read-the-case-studies")).toBe("Read the case studies");
  });
});
