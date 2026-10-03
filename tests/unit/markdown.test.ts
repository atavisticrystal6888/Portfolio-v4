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

describe("markdownToHtml lists next to prose", () => {
  const between = (html: string, open: string, close: string) => {
    const start = html.indexOf(open);
    const end = html.indexOf(close);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    return html.slice(start, end);
  };

  it("splits an intro line from an unordered list with no blank line between", () => {
    const html = markdownToHtml("Intro means:\n- a\n- b\n\nAfter");
    expect(between(html, "<ul>", "</ul>")).not.toContain("<br");
    expect(html).not.toMatch(/<p>(?:(?!<\/p>)[^])*<ul>/);
    expect(html).toContain("<p>Intro means:</p>");
    expect(html).toContain("<li>a</li>");
    expect(html).toContain("<li>b</li>");
    expect(html).toContain("<p>After</p>");
  });

  it("splits an intro line from an ordered list with no blank line between", () => {
    const html = markdownToHtml("Intro means:\n1. a\n2. b\n\nAfter");
    expect(between(html, "<ol>", "</ol>")).not.toContain("<br");
    expect(html).not.toMatch(/<p>(?:(?!<\/p>)[^])*<ol>/);
    expect(html).toContain("<p>Intro means:</p>");
    expect(html).toContain("<li>a</li>");
    expect(html).toContain("<p>After</p>");
  });

  it("ends a list that is followed directly by text without a blank line", () => {
    const html = markdownToHtml("Intro:\n- a\n- b\nAfter the list");
    expect(between(html, "<ul>", "</ul>")).not.toContain("<br");
    expect(between(html, "<ul>", "</ul>")).not.toContain("After the list");
    expect(html).not.toMatch(/<p>(?:(?!<\/p>)[^])*<ul>/);
    expect(html).toContain("<p>After the list</p>");
  });
});

describe("markdownToHtml paragraphs that open with inline markup", () => {
  it("wraps a bold-led paragraph in <p>", () => {
    const html = markdownToHtml("**Label:** the rest of the sentence.");
    expect(html).toBe("<p><strong>Label:</strong> the rest of the sentence.</p>");
  });

  it("wraps italic-, link- and code-led paragraphs in <p>", () => {
    expect(markdownToHtml("*Note:* dated.")).toBe("<p><em>Note:</em> dated.</p>");
    expect(markdownToHtml("[Home](/) is here.")).toBe('<p><a href="/">Home</a> is here.</p>');
    expect(markdownToHtml("`npm test` runs it.")).toBe("<p><code>npm test</code> runs it.</p>");
  });

  it("gives two consecutive bold-led paragraphs two <p> elements", () => {
    const html = markdownToHtml("**One:** first.\n\n**Two:** second.");
    expect(html.match(/<p>/g)).toHaveLength(2);
    expect(html).toContain("<p><strong>One:</strong> first.</p>");
    expect(html).toContain("<p><strong>Two:</strong> second.</p>");
  });

  it("still leaves real block tags unwrapped", () => {
    const html = markdownToHtml("<details><summary>More</summary>body</details>\n\n<section>x</section>");
    expect(html).not.toContain("<p><details");
    expect(html).not.toContain("<p><section");
  });
});

describe("markdownToHtml emphasis that contains a link", () => {
  it("converts an italic span wrapping a link, with no literal asterisks", () => {
    const html = markdownToHtml("*Dated note: see [the study](/projects/x) for more.*");
    expect(html).toContain('<em>Dated note: see <a href="/projects/x">the study</a> for more.</em>');
    expect(html).not.toContain("*");
  });

  it("keeps underscores inside hrefs untouched", () => {
    const html = markdownToHtml("See [shot](/a/_hero_.png) and _this_.");
    expect(html).toContain('href="/a/_hero_.png"');
    expect(html).toContain("<em>this</em>");
  });
});

describe("markdownToHtml tables next to prose", () => {
  it("wraps the paragraph after a table in its own <p>", () => {
    const html = markdownToHtml("| a | b |\n|---|---|\n| 1 | 2 |\n\nThe key insight: **bold** here.");
    expect(html).toContain("</table>");
    expect(html).toContain("<p>The key insight: <strong>bold</strong> here.</p>");
  });
});

describe("markdownToHtml headings next to prose", () => {
  it("wraps a line written directly under a heading in its own <p>", () => {
    const html = markdownToHtml("### 3. Rubric\nThe axes teach you _where_ you are weak.");
    expect(html).toContain("<h3>3. Rubric</h3>");
    expect(html).toContain("<p>The axes teach you <em>where</em> you are weak.</p>");
  });
});
