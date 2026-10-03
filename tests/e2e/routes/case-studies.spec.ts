import { test, expect, type Page } from "@playwright/test";
import { routesOfKind } from "../route-manifest";

/*
 * Every case study: a product page whose job is to let a reviewer read the
 * PM story in the canonical chapter order, jump to Validation, see the
 * evidence tier and last-verified date, and move to the next story.
 */
const CASE_STUDIES = routesOfKind("case-study").map((r) => r.path);
const CHAPTERS = [
  "Problem",
  "Users",
  "Decision",
  "Trade-offs",
  "What shipped",
  "Validation",
  "Limits and next",
  "Credits",
];
const STATUS_LABELS = [
  "Live",
  "Local build · not deployed",
  "Ready for local pilot",
  "Open source",
  "Private",
  "Internal",
  "Archived",
];
const HERO_NOTE = new Set(["hackmate", "cohort-retention-studio", "sawari"]);

const wide = (page: Page) => (page.viewportSize()?.width ?? 1280) >= 1200;

// The two first-screen sizes the masthead claims are checked at.
const FIRST_SCREENS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

async function open(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "networkidle" });
  expect(res?.status(), path).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

function field(page: Page, term: string) {
  return page
    .getByTestId("evidence-row")
    .locator("dt", { hasText: new RegExp(`^${term}$`) })
    .locator("xpath=following-sibling::dd[1]");
}

test.describe("Case studies", () => {
  test("manifest has the ten case studies", () => {
    expect(CASE_STUDIES).toHaveLength(10);
  });

  for (const path of CASE_STUDIES) {
    const slug = path.split("/").pop()!;

    test.describe(slug, () => {
      test("masthead evidence row and per-slug claims", async ({ page }) => {
        await open(page, path);
        await expect(page.getByTestId("evidence-row")).toBeVisible();
        // textContent, not innerText: the pill is CSS-uppercased. Read the
        // pill itself: the cell may also carry a status note beside it.
        const status = (
          (await field(page, "Status").getByTestId("status-pill").textContent()) ?? ""
        )
          .replace(/\s+/g, " ")
          .trim();
        expect(STATUS_LABELS, `status label "${status}"`).toContain(status);
        await expect(page.getByTestId("evidence-tier")).not.toBeEmpty();
        await expect(page.getByTestId("last-verified")).toHaveText(/Last verified\s*30 Sep 2026/);
        if (HERO_NOTE.has(slug)) await expect(page.getByTestId("hero-note")).toBeVisible();

        const text = await page.locator("main").innerText();
        if (slug === "aarchid") {
          expect(text).toContain("Dilpreet Grover");
          await expect(field(page, "Ownership")).toContainText(/co-built with Dilpreet Grover/i);
          expect(text).not.toMatch(/\bmyself\b/i);
          await expect(field(page, "Ownership")).not.toContainText(/solo/i);
        }
        if (slug === "sawari") {
          expect(status).toBe("Local build · not deployed");
          expect(text).toMatch(/not deployed/i);
          // The masthead must not undo the riders-only decision.
          const masthead = await page.getByRole("region", { name: "Product", exact: true }).innerText();
          expect(masthead).not.toMatch(/drivers|ride marketplace/i);
        }
        if (slug === "tcs-nqt-prep-hub") {
          expect(text).toContain("I built the web app.");
          expect(text).not.toMatch(/built with three other contributors|web app I led|four contributors/i);
          expect(text).toContain("Web app: solo. Question bank: three other contributors.");
        }
        if (slug === "desktasks") {
          await expect(page.getByTestId("status-note")).toHaveText(
            "Hosted v1.3.1 line is frozen; v2 alpha runs locally"
          );
        }
        if (slug === "experiment-hub" || slug === "kite-edge") {
          await expect(page.getByTestId("hero-caption")).toBeVisible();
          await expect(page.getByTestId("hero-caption")).toContainText(/synthetic/i);
        }
        if (slug === "hackmate") {
          await expect(page.getByTestId("evidence-tier")).toContainText("Self-reported");
        }
        if (slug === "cohort-retention-studio") {
          expect(status).toBe("Ready for local pilot");
          expect(text).toMatch(/local pilot/i);
          expect(text).toMatch(/hosted pilot[^.]{0,40}not verified/i);
        }
        if (slug === "aarchid") {
          // Owner decision 3 Oct 2026: the eval result is withheld until the
          // artefact or the co-builder's confirmation is available.
          await expect(page.getByTestId("evidence-tier")).toContainText("Self-reported");
          await expect(page.getByTestId("evidence-note")).toHaveText(
            "Self-reported: the team ran an offline eval on a golden set. The result is withheld here until the eval artefact or the co-builder's confirmation is available."
          );
          // No eval result figure anywhere on the page, and no metric strip.
          const body = await page.locator("body").innerText();
          expect(body).not.toContain("92%");
          expect(body).not.toContain("90%");
          expect(body).not.toContain("$0.25");
          await expect(page.getByRole("region", { name: "Key metrics" })).toHaveCount(0);
        }
        if (slug === "kite-edge") {
          const strip = await page.getByRole("region", { name: "Key metrics" }).innerText();
          expect(strip).toMatch(/Analytics only/i);
          expect(strip).not.toContain("43+");
        }
        expect(text).not.toMatch(/\bExa\b/);

        // Co-builders are credited in the structured data; solo studies list only the author.
        const creativeWork = JSON.parse(
          (await page.locator("#case-study-creative-work-jsonld").textContent()) ?? "{}"
        );
        expect(creativeWork["@type"]).toBe("CreativeWork");
        expect(creativeWork.url).toMatch(new RegExp(`/projects/${slug}$`));
        expect(creativeWork.author?.name).toBe("Dhruv Singhal");
        if (slug === "aarchid") {
          expect(creativeWork.contributor?.map((c: { name: string }) => c.name)).toEqual(["Dilpreet Grover"]);
        } else {
          expect(creativeWork.contributor).toBeUndefined();
        }
      });

      test("breadcrumb trail: Home / Projects / product, one BreadcrumbList", async ({ page }) => {
        await open(page, path);
        const trail = page.getByRole("navigation", { name: "Breadcrumb" });
        await expect(trail).toBeVisible();
        await expect(trail.getByRole("link")).toHaveCount(2);
        await expect(trail.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/");
        await expect(trail.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("href", "/projects");
        const current = trail.locator('[aria-current="page"]');
        await expect(current).toHaveCount(1);
        const h1 = (await page.getByRole("heading", { level: 1 }).textContent())?.trim();
        const name = (await current.textContent())?.trim();
        expect(name, "current crumb names the product").toBeTruthy();
        if (h1) expect(h1).toContain(name!);

        const lists = await page.locator('script[type="application/ld+json"]').allTextContents();
        const breadcrumbLists = lists.filter((t) => t.includes('"BreadcrumbList"'));
        expect(breadcrumbLists, "exactly one BreadcrumbList").toHaveLength(1);
        const ld = JSON.parse(breadcrumbLists[0]!);
        expect(ld.itemListElement).toHaveLength(3);
        expect(ld.itemListElement[2].item).toMatch(new RegExp(`^https?://[^/]+/projects/${slug}$`));

        await trail.getByRole("link", { name: "Projects", exact: true }).click();
        await expect(page).toHaveURL(/\/projects$/);
      });

      // One test per viewport, each with a single page load. Loading the same
      // URL twice in one page (with every request routed, to dodge Firefox's
      // 304 on the second load) hung on WebKit: the second navigation cancels
      // the first load's in-flight hero image, and Playwright's WebKit never
      // completes the re-request of that URL while routing is active.
      for (const viewport of FIRST_SCREENS) {
        test(`the decision's alternative and cost are in the first screen at ${viewport.width}x${viewport.height}`, async ({
          page,
        }) => {
          await page.setViewportSize(viewport);
          await open(page, path);
          const context = page.getByTestId("masthead-decision-context");
          await expect(context).toBeVisible();
          await expect(context).toContainText(/^Instead of\s/);
          await expect(context).toContainText(/Cost:\s\S/);
          const box = (await context.boundingBox())!;
          expect(box.y + box.height, `${slug} context bottom at ${viewport.width}`).toBeLessThanOrEqual(
            viewport.height
          );
          const decision = (await page.getByTestId("masthead-decision").boundingBox())!;
          const row = (await page.getByTestId("evidence-row").boundingBox())!;
          expect(box.y).toBeGreaterThan(decision.y);
          expect(box.y).toBeLessThan(row.y);
        });
      }

      test("image viewer traps focus, silences the page, and returns focus on Escape", async ({ page }) => {
        await open(page, path);
        const trigger = page.locator('[data-testid="hero-zoom"], [data-zoom-image]').first();
        test.skip((await trigger.count()) === 0, `${slug} has no zoomable image`);
        await trigger.scrollIntoViewIfNeeded();
        await trigger.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Case study image viewer" });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Close image viewer" })).toBeFocused();

        // The rest of the page is inert and hidden from assistive technology.
        expect(await page.locator("main").evaluate((el) => Boolean(el.closest("[inert]")))).toBe(true);
        expect(
          await page.locator("main").evaluate((el) => Boolean(el.closest('[aria-hidden="true"]')))
        ).toBe(true);

        const insideDialog = () =>
          page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press("Tab");
          expect(await insideDialog(), `Tab ${i + 1} stays in the dialog`).toBe(true);
        }
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press("Shift+Tab");
          expect(await insideDialog(), `Shift+Tab ${i + 1} stays in the dialog`).toBe(true);
        }

        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
        expect(await page.locator("main").evaluate((el) => Boolean(el.closest("[inert]")))).toBe(false);
        expect(
          await page.locator("main").evaluate((el) => Boolean(el.closest('[aria-hidden="true"]')))
        ).toBe(false);
      });

      for (const viewport of FIRST_SCREENS) {
        test(`the PM decision leads the masthead, inside the first screen at ${viewport.width}x${viewport.height}`, async ({
          page,
        }) => {
          await page.setViewportSize(viewport);
          await open(page, path);
          const decision = page.getByTestId("masthead-decision");
          await expect(decision).toBeVisible();
          await expect(decision).toContainText(/^Decision/);
          const box = (await decision.boundingBox())!;
          expect(box.y + box.height, `${slug} decision bottom at ${viewport.width}`).toBeLessThanOrEqual(
            viewport.height
          );
          // Above the evidence row, not after it.
          const row = (await page.getByTestId("evidence-row").boundingBox())!;
          expect(box.y).toBeLessThan(row.y);
        });
      }

      test("chapters are in canonical order and the chapter nav jumps to Validation", async ({ page }) => {
        await open(page, path);
        const h2s = (await page.locator("main h2").allInnerTexts()).map((t) => t.trim());
        expect(h2s.filter((t) => CHAPTERS.includes(t))).toEqual(CHAPTERS);

        if (wide(page)) {
          await expect(page.getByTestId("chapters-menu")).toBeHidden();
          const rail = page.getByRole("navigation", { name: "Chapters" }).filter({ visible: true });
          await expect(rail).toHaveCount(1);
          await expect(rail.getByRole("link")).toHaveCount(8);
          await rail.getByRole("link", { name: /^Validation/ }).click();
        } else {
          const menu = page.getByTestId("chapters-menu");
          await expect(menu).toBeVisible();
          await expect(menu.locator("summary")).toContainText("Chapters");
          await expect(async () => {
            await menu.locator("summary").click();
            await expect(menu).toHaveAttribute("open", "", { timeout: 1000 });
          }).toPass({ timeout: 10_000 });
          const nav = menu.getByRole("navigation", { name: "Chapters" });
          await expect(nav.getByRole("link")).toHaveCount(8);
          await nav.getByRole("link", { name: /Validation/ }).click();
          await expect(menu).not.toHaveAttribute("open", "");
        }
        const target = page.getByRole("heading", { level: 2, name: "Validation", exact: true });
        await expect(target).toBeFocused();
        await expect(target).toBeInViewport();
        await expect(page).toHaveURL(/#validation$/);
      });

      test("All projects returns to the index; prev/next moves between stories", async ({ page }) => {
        await open(page, path);
        // The masthead's back link became the breadcrumb trail (tested above);
        // "All projects" now lives once, between Previous and Next.
        const all = page.getByRole("link", { name: "All projects", exact: true });
        await expect(all).toHaveCount(1);
        await expect(
          page.getByRole("navigation", { name: "Case study navigation" }).getByRole("link", { name: "All projects", exact: true })
        ).toHaveCount(1);
        const nav = page.getByRole("navigation", { name: "Case study navigation" });
        const step = nav.getByRole("link", { name: /^(Next|← Previous|Previous)/ });
        expect(await step.count(), "prev or next link").toBeGreaterThan(0);
        const next = nav.getByRole("link", { name: /Next/ });
        const link = (await next.count()) ? next.first() : step.first();
        const href = await link.getAttribute("href");
        expect(href).toMatch(/^\/projects\/[a-z0-9-]+$/);
        expect(href).not.toBe(path);
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        await page.getByRole("link", { name: "All projects", exact: true }).first().click();
        await expect(page).toHaveURL(/\/projects$/);
        await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
      });
    });
  }
});
