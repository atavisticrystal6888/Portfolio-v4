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
  it("keeps in-body links to this site in the same tab", () => {
    const html = markdownToHtml("see the [case study](/projects/aarchid)");
    expect(html).toContain('<a href="/projects/aarchid">case study</a>');
    expect(html).not.toContain("target=");
  });

  it("opens off-site links in a new tab, with rel protection", () => {
    const html = markdownToHtml("[Dilpreet](https://github.com/dfordp) built the API");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("leaves mailto links in place without a new tab", () => {
    const html = markdownToHtml("[email me](mailto:someone@example.com)");
    expect(html).toContain('href="mailto:someone@example.com"');
    expect(html).not.toContain("target=");
  });

  it("keeps emphasis working after a bare < in prose", () => {
    const html = markdownToHtml(
      ["Latency: P95 <10s end-to-end.", "", "- **Unit economics:** ~$0.25 per user"].join("\n")
    );
    expect(html).toContain("<strong>Unit economics:</strong>");
    expect(html).not.toContain("**Unit economics:**");
  });
});

describe("markdownToHtml v5 artifact grammars", () => {
  it("passes a case-decision div through without paragraph-wrapping its closer", () => {
    const md = [
      "prose before",
      "",
      '<div class="case-decision">',
      "  <p>Stateless orchestrator, all persistence in Supabase.</p>",
      "</div>",
      "",
      "prose after",
    ].join("\n");
    const html = markdownToHtml(md);
    expect(html).toContain('<div class="case-decision">');
    expect(html).not.toContain("<p></div></p>");
    expect(html).not.toContain("<p><div");
  });

  it("restores a fenced code block inside a case-artifact figure", () => {
    const md = [
      '<figure class="case-artifact">',
      "```text",
      "boundary |z| > 2.316",
      "",
      "verdict CONTINUE",
      "```",
      "  <figcaption>The engine's actual output at α=0.05.</figcaption>",
      "</figure>",
    ].join("\n");
    const html = markdownToHtml(md);
    expect(html).toContain('<figure class="case-artifact">');
    expect(html).toContain("<pre");
    expect(html).toContain("boundary |z| &gt; 2.316");
    expect(html).toContain("<figcaption>");
    expect(html).not.toContain("<p></figure></p>");
    expect(html).not.toContain("<table");
  });
});
