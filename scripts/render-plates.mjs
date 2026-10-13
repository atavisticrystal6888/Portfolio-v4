#!/usr/bin/env node
/**
 * Blender product plates for every project in content/projects.json.
 *
 *   node scripts/render-plates.mjs [--only a,b] [--width 1600] [--samples 40]
 *                                  [--skip-existing] [--dry-run] [--post-only]
 *
 * For each project:
 *   1. Source image: `plateSource` or `imageUrl` under public/, or (when the project has no
 *      screenshot, or it is an SVG) a 1600x1000 title card rendered from HTML
 *      with the site's own fonts via Playwright (tmp/plates/cards/<slug>.png).
 *   2. Blender (headless, Cycles) renders scripts/blender/render-plate.py with
 *      the project's accent (site default when null) to tmp/plates/raw/<slug>.png.
 *      One theme-neutral render per project: transparent film, shadow in alpha.
 *   3. sharp trims the alpha bounds, fits the plate into a 1600x1000 canvas
 *      with even padding and writes public/images/plates/<slug>.webp and .avif.
 *   4. content/projects.json gets `plate: { src, avif, width, height }`.
 *
 * Requires Blender 5.x (env BLENDER or the default install path) and the repo's
 * sharp + playwright devDependencies.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLENDER =
  process.env.BLENDER || "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe";
const PLATE_SCRIPT = path.join(ROOT, "scripts/blender/render-plate.py");
const PROJECTS = path.join(ROOT, "content/projects.json");
const OUT_DIR = path.join(ROOT, "public/images/plates");
const RAW_DIR = path.join(ROOT, "tmp/plates/raw");
const CARD_DIR = path.join(ROOT, "tmp/plates/cards");
const CANVAS = { width: 1600, height: 1000 };
const PAD = { x: 48, y: 30 };
const DEFAULT_ACCENT = "#2137c4"; // --accent, light theme (src/styles/tokens.css)

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const only = flag("--only", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const width = Number(flag("--width", "1600"));
const samples = Number(flag("--samples", "40"));
const skipExisting = args.includes("--skip-existing");
const dryRun = args.includes("--dry-run");
const postOnly = args.includes("--post-only");

for (const d of [OUT_DIR, RAW_DIR, CARD_DIR]) mkdirSync(d, { recursive: true });

function fontFace(family, file, extra = "") {
  const url = pathToFileURL(path.join(ROOT, "public/fonts", file)).href;
  return `@font-face{font-family:"${family}";src:url("${url}") format("woff2");${extra}}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

/** Title card for projects without a raster screenshot: the masthead plate, as an image. */
function titleCardHtml(project, accent) {
  const name = project.productName || project.name;
  const eyebrow = [project.category, project.status].filter(Boolean).join(" · ").toUpperCase();
  const monogram = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFace("Fraunces", "fraunces-variable.woff2", "font-weight:100 900;")}
${fontFace("Manrope", "manrope-variable.woff2", "font-weight:200 800;")}
${fontFace("JetBrains Mono", "jetbrains-mono.woff2")}
html,body{margin:0;width:1600px;height:1000px;background:#fcfbf8;color:#121826;font-family:Manrope,sans-serif}
.card{position:relative;width:1600px;height:1000px;box-sizing:border-box;padding:96px 112px;display:flex;flex-direction:column;justify-content:space-between;
  background:linear-gradient(135deg, color-mix(in srgb, ${accent} 7%, #fcfbf8) 0%, #fcfbf8 60%)}
.bar{position:absolute;left:0;top:0;bottom:0;width:18px;background:${accent}}
.eyebrow{font-family:"JetBrains Mono",monospace;font-size:30px;font-weight:600;letter-spacing:.14em;color:${accent};display:flex;align-items:center;gap:20px}
.eyebrow::before{content:"";display:block;width:56px;height:2px;background:${accent}}
.name{font-family:Fraunces,serif;font-weight:600;font-size:150px;line-height:1.02;letter-spacing:-.02em;margin:0;max-width:1240px}
.tag{font-size:40px;line-height:1.35;color:#3b4457;max-width:1040px;margin:36px 0 0}
.mono{position:absolute;right:112px;bottom:96px;width:200px;height:200px;border-radius:8px;background:${accent};color:#fff;
  display:flex;align-items:center;justify-content:center;font-family:Fraunces,serif;font-weight:600;font-size:96px;letter-spacing:-.04em}
</style></head><body><div class="card"><div class="bar"></div>
<div class="eyebrow">${escapeHtml(eyebrow)}</div>
<div><h1 class="name">${escapeHtml(name)}</h1><p class="tag">${escapeHtml(project.tagline || project.description || "")}</p></div>
<div class="mono">${escapeHtml(monogram)}</div>
</div></body></html>`;
}

async function renderTitleCard(project, accent) {
  const out = path.join(CARD_DIR, `${project.slug}.png`);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: CANVAS, deviceScaleFactor: 1 });
    await page.setContent(titleCardHtml(project, accent), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out, type: "png" });
  } finally {
    await browser.close();
  }
  return out;
}

function sourceFor(project) {
  // `plateSource` lets a project mount a different (landscape) screenshot than
  // the one its card shows, for example when imageUrl is a portrait tearsheet.
  const src = project.plateSource || project.imageUrl;
  if (!src) return null;
  const abs = path.join(ROOT, "public", src);
  if (!existsSync(abs) || /\.svg$/i.test(abs)) return null;
  return abs;
}

function renderBlender(input, output, accent) {
  const res = spawnSync(
    BLENDER,
    ["-b", "--python", PLATE_SCRIPT, "--", "--input", input, "--output", output, "--accent", accent, "--width", String(width), "--samples", String(samples)],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const log = `${res.stdout}\n${res.stderr}`;
  if (res.status !== 0 || !/PLATE_OK/.test(log)) {
    const tail = log.split("\n").filter((l) => /Error|Traceback|line \d+|PLATE_OK/.test(l)).slice(-12).join("\n");
    throw new Error(`Blender failed for ${path.basename(output)} (exit ${res.status}):\n${tail}`);
  }
}

const TRIM = 24;
const FEATHER = 64; // px of edge fade for shadow-range alpha
const SHADOW_MAX = 110; // alpha below this is treated as shadow, not slab

/**
 * Trim the alpha bounds, then remap alpha so everything at or below the trim
 * threshold becomes fully transparent and the shadow fades to 0 at the crop
 * instead of stepping from ~20 to 0 (which read as a faint grey rectangle on
 * the light theme). Opaque pixels stay opaque.
 */
async function trimAndFeather(rawPng) {
  const trimmed = sharp(rawPng).ensureAlpha().trim({ threshold: TRIM });
  const { data, info } = await trimmed.raw().toBuffer({ resolveWithObject: true });
  const scale = 255 / (255 - TRIM);
  const { width: W, height: H } = info;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    let out = a <= TRIM ? 0 : Math.min(255, Math.round((a - TRIM) * scale));
    // The render frame clips the shadow's outer tail, which left a faint
    // straight cut near the bottom. Fade shadow-range alpha (never the slab)
    // over the outermost FEATHER pixels on every side.
    if (out > 0 && out < SHADOW_MAX) {
      const px = (i - 3) / 4;
      const x = px % W;
      const y = (px - x) / W;
      const d = Math.min(x, y, W - 1 - x, H - 1 - y);
      if (d < FEATHER) out = Math.round(out * (d / FEATHER));
    }
    data[i] = out;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function postProcess(rawPng, slug) {
  const trimmed = await trimAndFeather(rawPng);
  const fitted = await sharp(trimmed)
    .resize({
      width: CANVAS.width - 2 * PAD.x,
      height: CANVAS.height - 2 * PAD.y,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({ top: PAD.y, bottom: PAD.y, left: PAD.x, right: PAD.x, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const webp = path.join(OUT_DIR, `${slug}.webp`);
  const avif = path.join(OUT_DIR, `${slug}.avif`);
  await sharp(fitted).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(webp);
  await sharp(fitted).avif({ quality: 58, effort: 6 }).toFile(avif);
  const meta = await sharp(webp).metadata();
  return { webp, avif, width: meta.width, height: meta.height };
}

async function main() {
  if (!existsSync(BLENDER)) throw new Error(`Blender not found at ${BLENDER} (set BLENDER)`);
  const projects = JSON.parse(readFileSync(PROJECTS, "utf8"));
  const todo = projects.filter((p) => only.length === 0 || only.includes(p.slug));
  const results = [];
  for (const project of todo) {
    const slug = project.slug;
    const accent = project.accent || DEFAULT_ACCENT;
    const webpOut = path.join(OUT_DIR, `${slug}.webp`);
    if (postOnly && !existsSync(path.join(RAW_DIR, `${slug}.png`))) {
      console.log(`skip ${slug} (no raw render for --post-only)`);
      continue;
    }
    if (skipExisting && existsSync(webpOut) && existsSync(webpOut.replace(/\.webp$/, ".avif"))) {
      console.log(`skip ${slug} (exists)`);
      continue;
    }
    const started = Date.now();
    let input = sourceFor(project);
    const kind = input ? "screenshot" : "title-card";
    if (dryRun) {
      console.log(`would render ${slug}: ${kind}, accent ${accent}`);
      continue;
    }
    if (!input) input = await renderTitleCard(project, accent);
    const raw = path.join(RAW_DIR, `${slug}.png`);
    if (postOnly && existsSync(raw)) {
      // Re-run only the sharp stage on an existing Blender render.
    } else {
    try {
      renderBlender(input, raw, accent);
    } catch (e) {
      // Cycles can fail with "out of memory" when a build runs alongside it;
      // one retry after a pause recovers that without restarting the batch.
      const firstLine = String(e.message).split(String.fromCharCode(10))[0];
      console.warn(`retrying ${slug} after: ${firstLine}`);
      await new Promise((r) => setTimeout(r, 20000));
      renderBlender(input, raw, accent);
    }
    }
    const out = await postProcess(raw, slug);
    recordPlates();
    const kb = (f) => Math.round(readFileSync(f).length / 1024);
    console.log(
      `ok ${slug}: ${kind}, ${out.width}x${out.height}, webp ${kb(out.webp)} KB, avif ${kb(out.avif)} KB, ${Math.round((Date.now() - started) / 1000)} s`,
    );
    results.push({ slug, out });
  }
  if (dryRun) return;
  recordPlates();
}

/** Record every plate that exists on disk; called after each render so a crash keeps progress. */
function recordPlates() {
  const fresh = JSON.parse(readFileSync(PROJECTS, "utf8"));
  for (const p of fresh) {
    const webp = path.join(OUT_DIR, `${p.slug}.webp`);
    const avif = path.join(OUT_DIR, `${p.slug}.avif`);
    if (existsSync(webp) && existsSync(avif)) {
      p.plate = {
        src: `/images/plates/${p.slug}.webp`,
        avif: `/images/plates/${p.slug}.avif`,
        width: CANVAS.width,
        height: CANVAS.height,
      };
    }
  }
  writeFileSync(PROJECTS, JSON.stringify(fresh, null, 2) + "\n");
  console.log(`wrote plate fields for ${fresh.filter((p) => p.plate).length} projects`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
