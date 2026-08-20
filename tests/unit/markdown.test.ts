import { describe, it, expect } from "vitest";
import { markdownToHtml } from "@/lib/markdown";

describe("markdownToHtml emphasis", () => {
  it("renders underscore emphasis instead of leaking the markers", () => {
    const html = markdownToHtml("look at _your_ plant");
    expect(html).toContain("<em>your</em>");
    expect(html).not.toContain("_your_");
  });

  it("renders double-underscore strong", () => {
    expect(markdownToHtml("__loud__ claim")).toContain("<strong>loud</strong>");
  });

  it("leaves snake_case identifiers alone", () => {
    const html = markdownToHtml("The feature_adoption_score column and days_since_last_login.");
    expect(html).toContain("feature_adoption_score");
    expect(html).not.toContain("<em>");
  });

  it("still renders asterisk emphasis", () => {
    const html = markdownToHtml("teams need a *reason* and **proof**");
    expect(html).toContain("<em>reason</em>");
    expect(html).toContain("<strong>proof</strong>");
  });

  it("does not touch underscores inside code", () => {
    const html = markdownToHtml("Call `monte_carlo_var(sims=10_000)` first.");
    expect(html).toContain("monte_carlo_var(sims=10_000)");
    expect(html).not.toContain("<em>");
  });

  it("does not rewrite attribute values in generated tags", () => {
    const html = markdownToHtml("[docs](https://example.com/a/_hero_.png)");
    expect(html).toContain('href="https://example.com/a/_hero_.png"');
  });
});
