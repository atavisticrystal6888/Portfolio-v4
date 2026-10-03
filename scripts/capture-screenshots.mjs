#!/usr/bin/env node
/**
 * Screenshot capture (Lane V, 2026-09-30). Requires a running server.
 *
 *   BASE_URL=http://localhost:3100 node scripts/capture-screenshots.mjs
 *
 * Every route in tests/e2e/route-manifest.ts x {desktop 1440x900, mobile 390x844}
 * x {light, dark}, full page, JPEG q60 ->
 *   tmp/pm-candidate-20260930/screenshots/<slug>--<desktop|mobile>-<light|dark>.jpg
 * plus a top-of-page viewport shot for mobile-light (<slug>--mobile-light-top.jpg)
 * and 1440 light PNGs of /, /projects, /about ->
 *   tmp/pm-candidate-20260930/portfolio-site-shots/{home,projects,about}.png
 * (public/ is never written; the polish lane copies those PNGs.)
 *
 * Theme is applied the way tests/e2e/theme.spec.ts does it: click the header
 * toggle until <html data-theme> flips. If the toggle is not reachable (e.g.
 * hidden in a collapsed layout) it falls back to the stored preference the
 * inline boot script reads (localStorage "ds-portfolio-theme") and reloads.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const BASE = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100";
// SHOTS_DIR picks the evidence folder so a later run does not overwrite an earlier one.
const SHOTS_DIR = process.env.SHOTS_DIR || "tmp/pm-candidate-20260930";
const OUT = path.join(ROOT, SHOTS_DIR, "screenshots");
const SITE_SHOTS = path.join(ROOT, SHOTS_DIR, "portfolio-site-shots");
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);

function loadRoutes() {
  const src = fs.readFileSync(path.join(ROOT, "tests/e2e/route-manifest.ts"), "utf8");
  const json = src.match(/export const ROUTES: RouteEntry\[\] = (\[[\s\S]*?\n\]);/);
  if (!json) throw new Error("Could not read ROUTES from tests/e2e/route-manifest.ts (run npm run routes:manifest)");
  return JSON.parse(json[1]);
}

const slugOf = (p) => (p === "/" ? "home" : p.slice(1).split("/").join("_"));

const VARIANTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, isMobile: false },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true },
];
const THEMES = ["light", "dark"];

async function applyTheme(page, theme) {
  const html = page.locator("html");
  if ((await html.getAttribute("data-theme")) === theme) return "already";
  const toggle = page.getByRole("button", { name: /toggle theme|theme/i }).first();
  if (await toggle.isVisible().catch(() => false)) {
    for (let i = 0; i < 20; i++) {
      if ((await html.getAttribute("data-theme")) === theme) return "toggle";
      await toggle.click().catch(() => {});
      await page.waitForTimeout(250);
    }
  }
  await page.evaluate((mode) => {
    const cur = JSON.parse(localStorage.getItem("ds-portfolio-theme") || "{}");
    localStorage.setItem("ds-portfolio-theme", JSON.stringify({ palette: "teal", ...cur, mode }));
  }, theme);
  await page.reload({ waitUntil: "networkidle" });
  if ((await html.getAttribute("data-theme")) !== theme) throw new Error(`theme ${theme} did not apply`);
  return "storage";
}

async function settle(page) {
  await page.evaluate(async () => {
    const h = () => document.body.scrollHeight;
    for (let y = 0; y < h(); y += Math.round(window.innerHeight * 0.8)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await Promise.all(
      [...document.images].filter((i) => !i.complete).map(
        (i) => new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); setTimeout(r, 4000); })
      )
    );
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(600);
}

async function main() {
  const routes = loadRoutes();
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(SITE_SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const jobs = [];
  for (const v of VARIANTS) for (const theme of THEMES) for (const r of routes) jobs.push({ v, theme, r });

  const contexts = new Map();
  for (const v of VARIANTS) for (const theme of THEMES) {
    contexts.set(`${v.name}-${theme}`, await browser.newContext({
      viewport: v.viewport,
      deviceScaleFactor: 1,
      isMobile: v.isMobile,
      hasTouch: v.isMobile,
      reducedMotion: "reduce",
    }));
  }

  const written = [];
  const failures = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const { v, theme, r } = jobs[next++];
      const variant = `${v.name}-${theme}`;
      const page = await contexts.get(variant).newPage();
      try {
        const res = await page.goto(BASE + r.path, { waitUntil: "networkidle", timeout: 60_000 });
        if (res?.status() !== r.expectStatus) throw new Error(`status ${res?.status()} != ${r.expectStatus}`);
        await applyTheme(page, theme);
        await settle(page);
        const base = path.join(OUT, `${slugOf(r.path)}--${variant}`);
        if (variant === "mobile-light") {
          await page.screenshot({ path: `${base}-top.jpg`, type: "jpeg", quality: 60 });
          written.push(`${base}-top.jpg`);
        }
        await page.screenshot({ path: `${base}.jpg`, type: "jpeg", quality: 60, fullPage: true });
        written.push(`${base}.jpg`);
        if (variant === "desktop-light" && ["/", "/projects", "/about"].includes(r.path)) {
          const png = path.join(SITE_SHOTS, `${r.path === "/" ? "home" : r.path.slice(1)}.png`);
          await page.screenshot({ path: png, type: "png" });
          written.push(png);
        }
      } catch (e) {
        failures.push(`${r.path} ${variant}: ${e.message.split("\n")[0]}`);
      } finally {
        await page.close();
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await browser.close();
  console.log(`screenshots written: ${written.length}`);
  if (failures.length) {
    console.error(`failures (${failures.length}):\n${failures.join("\n")}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
