import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "../route-manifest";

/*
 * WCAG 1.4.10 Reflow: every manifest route at 320 CSS px wide, and at a
 * 640x450 viewport with deviceScaleFactor 2 (a 1280x900 window at 200% zoom),
 * must not scroll horizontally and must not push content past the right edge.
 *
 * An element past the edge is an offender unless an ancestor clips or
 * scrolls it horizontally (carousels, code blocks, wide tables are allowed
 * to scroll inside their own box) or it is invisible / screen-reader-only.
 * These tests set their own viewport, so they run on the desktop chromium
 * project only.
 */

interface Overflow {
  scrollWidth: number;
  clientWidth: number;
  offenders: string[];
}

async function measure(page: Page): Promise<Overflow> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const vw = root.clientWidth;
    const offenders: string[] = [];
    const describe = (el: Element) => {
      const id = el.id ? `#${el.id}` : "";
      const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/)[0]}` : "";
      return `${el.tagName.toLowerCase()}${id}${cls}`;
    };
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      if (r.right <= vw + 1) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.opacity === "0") continue;
      if (cs.position === "fixed" && r.left >= vw) continue; // off-canvas drawer
      if (el.closest('[aria-hidden="true"]') && cs.pointerEvents === "none") continue;
      let clipped = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) {
          clipped = true;
          break;
        }
      }
      if (clipped) continue;
      // Report only the outermost offender of a subtree.
      const parent = el.parentElement;
      if (parent && parent !== document.body && parent.getBoundingClientRect().right > vw + 1) continue;
      offenders.push(`${describe(el)} right=${Math.round(r.right)} (vw ${vw})`);
    }
    return { scrollWidth: root.scrollWidth, clientWidth: vw, offenders: offenders.slice(0, 10) };
  });
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
}

test.describe("Reflow at 320 CSS px", () => {
  test.use({ viewport: { width: 320, height: 700 } });
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "viewport-controlled; chromium desktop only");
  });

  for (const route of ROUTES) {
    test(`${route.path} reflows at 320px`, async ({ page }) => {
      const res = await page.goto(route.path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(route.expectStatus);
      await scrollThrough(page);
      const m = await measure(page);
      expect(m.scrollWidth, `horizontal scroll: ${m.scrollWidth} > ${m.clientWidth}`).toBeLessThanOrEqual(m.clientWidth);
      expect(m.offenders, "elements past the right edge").toEqual([]);
    });
  }
});

test.describe("Reflow at 200% zoom (640x450 @2x)", () => {
  test.use({ viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 });
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "viewport-controlled; chromium desktop only");
  });

  for (const route of ROUTES) {
    test(`${route.path} reflows at 200% zoom`, async ({ page }) => {
      const res = await page.goto(route.path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(route.expectStatus);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await scrollThrough(page);
      const m = await measure(page);
      expect(m.scrollWidth, `horizontal scroll: ${m.scrollWidth} > ${m.clientWidth}`).toBeLessThanOrEqual(m.clientWidth);
      expect(m.offenders, "elements past the right edge").toEqual([]);
    });
  }
});
