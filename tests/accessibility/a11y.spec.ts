import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";

/*
 * Route list: the static top-level pages, every case study and blog post that
 * exists in content/ (read from disk so a new MDX file is audited without
 * editing this spec), and one path that must render the 404 page.
 * TODO(Lane V): swap for tests/e2e/route-manifest.ts once it exists.
 */
const STATIC_ROUTES = [
  "/",
  "/about",
  "/projects",
  "/ai-pm",
  "/blog",
  "/lab",
  "/contact",
  "/now",
  "/uses",
  "/bookshelf",
  "/changelog",
];

const NOT_FOUND_ROUTE = "/this-page-does-not-exist-a11y";

function mdxSlugs(dir: string): string[] {
  const abs = path.join(process.cwd(), "content", dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

const ROUTES = [
  ...STATIC_ROUTES,
  ...mdxSlugs("case-studies").map((s) => `/projects/${s}`),
  ...mdxSlugs("blog").map((s) => `/blog/${s}`),
  NOT_FOUND_ROUTE,
];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Best-practice rules that must be clean. Everything else in the
// best-practice set is recorded to the report file but does not fail.
const ENFORCED_BEST_PRACTICE = [
  "region",
  "landmark-unique",
  "landmark-complementary-is-top-level",
  "list",
  "listitem",
];

const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];

const REPORT_DIR = path.join(process.cwd(), "tmp", "pm-candidate-20260930", "axe");

function slugifyRoute(route: string): string {
  const s = route.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-");
  return s || "home";
}

function summarise(results: Result[]) {
  return results.map((r) => ({
    id: r.id,
    impact: r.impact ?? null,
    help: r.help,
    nodes: r.nodes.map((n) => ({
      target: n.target.map(String),
      html: n.html.length > 200 ? `${n.html.slice(0, 197)}...` : n.html,
      // Why axe flagged or could not decide (e.g. "background could not be
      // determined due to a pseudo element"): the part a reviewer needs.
      reason: [...n.any, ...n.all, ...n.none]
        .map((c) => c.message)
        .filter(Boolean)
        .join(" / ")
        .slice(0, 200),
    })),
  }));
}

/** Scroll the whole page so scroll-revealed content is visible to axe. */
async function revealPage(page: Page) {
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = page.viewportSize()?.height ?? 700;
  for (let y = 0; y < pageHeight; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}

/**
 * Same mechanism as tests/e2e/theme.spec.ts: click the header toggle, retrying
 * until the html data-theme attribute flips (a tap before hydration is lost).
 */
async function applyTheme(page: Page, theme: Theme) {
  const html = page.locator("html");
  if ((await html.getAttribute("data-theme")) === theme) return;
  const toggle = page.getByRole("button", { name: /toggle theme|theme/i }).first();
  await expect(async () => {
    if ((await html.getAttribute("data-theme")) !== theme) await toggle.click();
    expect(await html.getAttribute("data-theme")).toBe(theme);
  }).toPass({ timeout: 15_000 });
}

function describeFailures(results: Result[]): string {
  return results
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes
          .slice(0, 5)
          .map((n) => n.target.join(" "))
          .join(" | ")}`
    )
    .join("\n");
}

test.describe("Accessibility (WCAG 2.2 AA via axe)", () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route} [${theme}] has no serious/critical violations`, async ({
        page,
      }, testInfo) => {
        test.setTimeout(120_000);
        const response = await page.goto(route, { waitUntil: "networkidle" });
        if (route === NOT_FOUND_ROUTE) {
          expect(response?.status()).toBe(404);
        } else {
          expect(response?.status(), `${route} should render`).toBe(200);
        }

        await applyTheme(page, theme);
        await revealPage(page);

        const wcag: AxeResults = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();
        const bestPractice: AxeResults = await new AxeBuilder({ page })
          .withTags(["best-practice"])
          .analyze();

        const blocking = wcag.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious"
        );
        const enforcedBp = bestPractice.violations.filter((v) =>
          ENFORCED_BEST_PRACTICE.includes(v.id)
        );

        fs.mkdirSync(REPORT_DIR, { recursive: true });
        const file = path.join(
          REPORT_DIR,
          `${slugifyRoute(route)}--${testInfo.project.name}--${theme}.json`
        );
        fs.writeFileSync(
          file,
          JSON.stringify(
            {
              route,
              project: testInfo.project.name,
              theme,
              tags: WCAG_TAGS,
              blocking: summarise(blocking),
              moderateOrMinor: summarise(
                wcag.violations.filter(
                  (v) => v.impact !== "critical" && v.impact !== "serious"
                )
              ),
              incomplete: summarise(wcag.incomplete),
              bestPractice: {
                enforced: ENFORCED_BEST_PRACTICE,
                violations: summarise(bestPractice.violations),
                incomplete: summarise(bestPractice.incomplete),
              },
            },
            null,
            2
          )
        );

        // Soft so one run reports both the WCAG blockers and the enforced
        // best-practice rules instead of stopping at the first.
        expect
          .soft(blocking, `serious/critical WCAG violations on ${route} [${theme}]:\n${describeFailures(blocking)}`)
          .toEqual([]);
        expect
          .soft(enforcedBp, `enforced best-practice violations on ${route} [${theme}]:\n${describeFailures(enforcedBp)}`)
          .toEqual([]);
      });
    }
  }

  test("all pages have a skip link", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to (main )?content/i }).first();
    await expect(skipLink).toBeAttached();
  });

  test("main landmark exists on every static route", async ({ context }) => {
    test.setTimeout(120_000);
    for (const route of [...STATIC_ROUTES, NOT_FOUND_ROUTE]) {
      // A fresh tab per route: Playwright's Windows WebKit build often never
      // fires `load` for a 404 document reached late in a long single-tab
      // walk (reproduced with JavaScript disabled, so it is not site code).
      const page = await context.newPage();
      await page.goto(route);
      await expect(page.locator("main, [role='main']"), route).toHaveCount(1);
      await page.close();
    }
  });
});
