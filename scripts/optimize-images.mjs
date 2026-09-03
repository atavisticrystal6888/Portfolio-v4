#!/usr/bin/env node
/**
 * Squeeze the raster assets we ship as-is.
 *
 * `next/image` re-encodes anything rendered through <Image>, but the case-study
 * lightbox (raw <img>) and the README screenshots serve the files in
 * `public/images` and `docs/` byte-for-byte. This script re-encodes those in
 * place:
 *
 *   PNG  -> palette quantisation (sharp/libimagequant), compressionLevel 9,
 *           effort 10, taking the cheapest quality that survives three checks:
 *           overall error, gradient banding, and small saturated accents (a
 *           status dot must not come out grey). Anything that fails every
 *           quality, or carries soft alpha, falls back to full-colour PNG.
 *   JPEG -> mozjpeg q82.
 *
 * Dimensions, filenames and EXIF orientation are preserved so every reference in
 * src/ and content/ keeps working. A candidate only replaces the original when
 * it is at least MIN_SAVING smaller.
 *
 * Usage:
 *   node scripts/optimize-images.mjs [--dry-run] [--verbose]
 *        [--max-kb=300] [--quality=95] [--retry-quality=90] [--min-saving=15]
 *        [path ...]
 */

import { createRequire } from "node:module";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TARGETS = ["public/images", "docs"];
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

// --- CLI ------------------------------------------------------------------
const argv = process.argv.slice(2);
const numberFlag = (name, fallback) => {
  const hit = argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
const DRY_RUN = argv.includes("--dry-run");
const VERBOSE = argv.includes("--verbose");
const MAX_KB = numberFlag("max-kb", 300); // files above this may try a lower quality first
const BASE_QUALITY = numberFlag("quality", 95);
const RETRY_QUALITY = numberFlag("retry-quality", 90);
const MIN_SAVING = numberFlag("min-saving", 15) / 100;
const targets = argv.filter((arg) => !arg.startsWith("--"));

// Palette quantisation is rejected when the error it introduces is large enough
// to read as banding across a gradient.
const BANDING_MEAN_ERROR = 2.0; // mean absolute channel error, 0-255
const BANDING_BAD_PIXELS = 0.02; // share of pixels off by more than 12/255
const REQUANTISE_SAVING = 0.3; // a second quantisation of an indexed source must save this much

// Averages hide the failure that actually matters on UI screenshots: a small,
// saturated accent (a green "healthy" status dot, a red badge) covers so few
// pixels that dropping it from the palette barely moves the mean error, but it
// turns the dot grey. Any saturated source colour covering at least
// ACCENT_MIN_PIXELS must survive within ACCENT_MAX_DISTANCE of a palette entry.
const ACCENT_MIN_PIXELS = 24;
const ACCENT_MIN_SATURATION = 0.3;
const ACCENT_MIN_VALUE = 0.15;
const ACCENT_MAX_DISTANCE = 40; // Euclidean RGB

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && RASTER.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

/** Mean and outlier channel error between the source pixels and a candidate encoding. */
async function compare(originalRaw, candidateBuffer, info) {
  const { data } = await sharp(candidateBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== originalRaw.length) return { mean: Infinity, bad: 1 };

  let sum = 0;
  let bad = 0;
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += 4) {
    let worst = 0;
    for (let channel = 0; channel < 3; channel += 1) {
      const diff = Math.abs(data[i + channel] - originalRaw[i + channel]);
      sum += diff;
      if (diff > worst) worst = diff;
    }
    if (worst > 12) bad += 1;
  }
  return { mean: sum / (pixels * 3), bad: bad / pixels };
}

/** Saturated source colours, by pixel count, that are worth protecting from the palette. */
function accentColours(raw) {
  const histogram = new Map();
  for (let i = 0; i < raw.length; i += 4) {
    if (raw[i + 3] === 0) continue;
    const key = (raw[i] << 16) | (raw[i + 1] << 8) | raw[i + 2];
    histogram.set(key, (histogram.get(key) ?? 0) + 1);
  }

  const accents = [];
  for (const [key, count] of histogram) {
    if (count < ACCENT_MIN_PIXELS) continue;
    const r = (key >> 16) & 255;
    const g = (key >> 8) & 255;
    const b = key & 255;
    const max = Math.max(r, g, b);
    if (max < ACCENT_MIN_VALUE * 255) continue;
    const saturation = (max - Math.min(r, g, b)) / max;
    if (saturation < ACCENT_MIN_SATURATION) continue;
    accents.push({ r, g, b, count });
  }
  return accents;
}

/** Pixel count of saturated source colours with no close match in the candidate's palette. */
async function accentLoss(accents, candidateBuffer) {
  if (accents.length === 0) return 0;

  const { data } = await sharp(candidateBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const palette = new Set();
  for (let i = 0; i < data.length; i += 4) {
    palette.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  }
  const entries = [...palette].map((key) => [(key >> 16) & 255, (key >> 8) & 255, key & 255]);

  const limit = ACCENT_MAX_DISTANCE * ACCENT_MAX_DISTANCE;
  let lost = 0;
  for (const accent of accents) {
    let nearest = Infinity;
    for (const [r, g, b] of entries) {
      const distance = (accent.r - r) ** 2 + (accent.g - g) ** 2 + (accent.b - b) ** 2;
      if (distance < nearest) nearest = distance;
      if (nearest <= limit) break;
    }
    if (nearest > limit) lost += accent.count;
  }
  return lost;
}

/** Partial transparency survives palette tRNS badly, so treat it as a banding risk. */
function hasSoftAlpha(raw) {
  for (let i = 3; i < raw.length; i += 4) {
    if (raw[i] !== 255 && raw[i] !== 0) return true;
  }
  return false;
}

function pngPipeline(file, orientation) {
  const pipeline = sharp(file, { failOn: "none" });
  return orientation && orientation > 1 ? pipeline.withMetadata({ orientation }) : pipeline;
}

async function encodePng(file, orientation, quality, palette) {
  return pngPipeline(file, orientation)
    .png(
      palette
        ? { palette: true, quality, compressionLevel: 9, effort: 10 }
        : { palette: false, compressionLevel: 9, effort: 10 },
    )
    .toBuffer();
}

async function optimizePng(file, before, orientation, alreadyIndexed) {
  const { data: originalRaw, info } = await sharp(file, { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let best = null;
  let note = "";

  if (hasSoftAlpha(originalRaw)) {
    note = "soft alpha -> full colour";
  } else {
    // An already-indexed source has been quantised once before (possibly by an
    // earlier run of this script). Re-quantising is still worth it when the file
    // is clearly oversized for its palette, but it has to earn a bigger win
    // under a tighter error budget so repeated runs converge instead of drifting.
    const meanBudget = alreadyIndexed ? BANDING_MEAN_ERROR / 2 : BANDING_MEAN_ERROR;
    const badBudget = alreadyIndexed ? BANDING_BAD_PIXELS / 2 : BANDING_BAD_PIXELS;
    const requiredSaving = alreadyIndexed ? REQUANTISE_SAVING : MIN_SAVING;
    const accents = accentColours(originalRaw);

    // Ascending quality: take the cheapest encode that clears every check. An
    // oversized file is allowed one attempt below BASE_QUALITY first.
    const ladder = before > MAX_KB * 1024 ? [RETRY_QUALITY, BASE_QUALITY, 100] : [BASE_QUALITY, 100];
    for (const quality of ladder) {
      const candidate = await encodePng(file, orientation, quality, true);
      const error = await compare(originalRaw, candidate, info);
      const lost = await accentLoss(accents, candidate);
      if (VERBOSE) {
        console.log(
          `    palette q${quality}${alreadyIndexed ? " (re-quantise)" : ""} -> ` +
            `${(candidate.length / 1024).toFixed(0)} KB, meanErr ${error.mean.toFixed(2)}, ` +
            `badPx ${(error.bad * 100).toFixed(2)}%, accentPxLost ${lost}`,
        );
      }
      if ((before - candidate.length) / before < requiredSaving) {
        best = null;
        note = alreadyIndexed ? "already indexed, re-quantise not worth it" : "palette gains too small";
        break; // higher quality only gets bigger, so stop climbing
      }
      if (error.mean > meanBudget || error.bad > badBudget) {
        best = null;
        note = "banding risk";
        continue;
      }
      if (lost >= ACCENT_MIN_PIXELS) {
        best = null;
        note = "accent colour lost";
        continue;
      }
      best = candidate;
      note = alreadyIndexed ? `palette q${quality} (re-quantised)` : `palette q${quality}`;
      break;
    }
    if (!best && note) note = `${note} -> full colour`;
  }

  const fullColour = await encodePng(file, orientation, BASE_QUALITY, false);
  if (VERBOSE) console.log(`    full colour -> ${(fullColour.length / 1024).toFixed(0)} KB`);
  if (!best) return { buffer: fullColour, note };
  if (fullColour.length < best.length) return { buffer: fullColour, note: `${note}, full colour smaller` };
  return { buffer: best, note };
}

async function optimizeJpeg(file, orientation) {
  const buffer = await pngPipeline(file, orientation).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return { buffer, note: "mozjpeg q82" };
}

async function main() {
  const roots = (targets.length ? targets : DEFAULT_TARGETS).map((target) => path.resolve(ROOT, target));
  const files = [];
  for (const root of roots) {
    const info = await stat(root).catch(() => null);
    if (!info) continue;
    if (info.isFile()) files.push(root);
    else for await (const found of walk(root)) files.push(found);
  }
  files.sort();

  const rows = [];
  const stillLarge = [];
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const before = (await readFile(file)).length;
    const meta = await sharp(file, { failOn: "none" }).metadata();
    if (VERBOSE) console.log(`  ${rel} (${meta.width}x${meta.height}, ${Math.round(before / 1024)} KB)`);

    const { buffer, note } =
      path.extname(file).toLowerCase() === ".png"
        ? await optimizePng(file, before, meta.orientation, Boolean(meta.isPalette))
        : await optimizeJpeg(file, meta.orientation);

    const check = await sharp(buffer).metadata();
    const sameDimensions = check.width === meta.width && check.height === meta.height;
    const saving = (before - buffer.length) / before;
    const keep = sameDimensions && saving >= MIN_SAVING;

    if (keep && !DRY_RUN) await writeFile(file, buffer);

    const after = keep ? buffer.length : before;
    totalBefore += before;
    totalAfter += after;
    if (after > MAX_KB * 1024) stillLarge.push(`${rel} (${(after / 1024).toFixed(0)} KB)`);

    let outcome;
    if (!sameDimensions) outcome = "SKIPPED: dimensions changed";
    else if (keep) outcome = note;
    else outcome = `kept original (${(saving * 100).toFixed(1)}% < ${MIN_SAVING * 100}%)`;

    rows.push({ file: rel, before: before / 1024, after: after / 1024, saved: keep ? saving * 100 : 0, note: outcome });
  }

  const width = Math.max(4, ...rows.map((row) => row.file.length));
  console.log(`\n${DRY_RUN ? "DRY RUN - nothing written" : "Rewrote files in place"}\n`);
  console.log(`${"file".padEnd(width)} | before KB | after KB | saved % | note`);
  console.log(`${"-".repeat(width)}-+-----------+----------+---------+-----`);
  for (const row of rows) {
    console.log(
      `${row.file.padEnd(width)} | ${row.before.toFixed(0).padStart(9)} | ${row.after.toFixed(0).padStart(8)} | ` +
        `${row.saved.toFixed(1).padStart(7)} | ${row.note}`,
    );
  }
  console.log(`${"-".repeat(width)}-+-----------+----------+---------+-----`);
  const totalSaved = totalBefore ? ((totalBefore - totalAfter) / totalBefore) * 100 : 0;
  console.log(
    `${"TOTAL".padEnd(width)} | ${(totalBefore / 1024).toFixed(0).padStart(9)} | ` +
      `${(totalAfter / 1024).toFixed(0).padStart(8)} | ${totalSaved.toFixed(1).padStart(7)} |`,
  );
  if (stillLarge.length) console.log(`\nStill over ${MAX_KB} KB: ${stillLarge.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
