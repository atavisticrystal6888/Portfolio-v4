#!/usr/bin/env node
/**
 * Generates src/app/favicon.ico from the branded "DS" mark.
 *
 * The mark is the same one src/app/icon.tsx and public/icon.svg render:
 * a near-black rounded square with a subtle 135deg gradient and "DS" set in
 * a serif face, tightly tracked, in the teal accent (#5ba4b5).
 *
 * Legacy .ico is still what browsers ask for at /favicon.ico, and Next only
 * copies the file through — so it has to be a real multi-image ICO. We render
 * 16/32/48 px PNGs with sharp and pack them ourselves: an ICONDIR header, one
 * 16-byte ICONDIRENTRY per size, then the PNG payloads. PNG-compressed entries
 * are valid ICO (Vista+) and every browser in use reads them.
 *
 * Run: npm run favicon:generate
 */

import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(REPO_ROOT, "src", "app", "favicon.ico");

/** Sizes packed into the ICO, smallest first. */
const SIZES = [16, 32, 48];

const BG_FROM = "#0a0a0b";
const BG_TO = "#17171d";
const FG = "#5ba4b5";
const FONT_STACK = "Georgia, 'Times New Roman', 'DejaVu Serif', serif";

/**
 * The mark at an arbitrary pixel size.
 *
 * 16px gets less corner rounding and looser tracking than the larger sizes: at
 * that scale a 0.2 radius eats a whole pixel of the D's stem and -0.08em welds
 * the two letters together, so both ease off as the canvas shrinks.
 */
function markSvg(size) {
  const small = size <= 16;
  const radius = size * (small ? 0.14 : 0.2);
  const fontSize = size * (small ? 0.56 : 0.54);
  const tracking = fontSize * (small ? -0.04 : -0.08);
  // text-anchor="middle" measures the run including the trailing letter-space,
  // so half of it has to come back or the pair sits left of centre.
  const cx = size / 2 - tracking / 2;
  // Cap height of a serif face lands near 0.7em; half of that below the middle
  // puts the optical centre on the canvas centre.
  const baseline = size / 2 + fontSize * 0.35;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BG_FROM}"/>
      <stop offset="1" stop-color="${BG_TO}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>
  <text x="${cx}" y="${baseline}" text-anchor="middle" font-family="${FONT_STACK}" font-weight="700" font-size="${fontSize}" letter-spacing="${tracking}" fill="${FG}">DS</text>
</svg>`;
}

async function renderPng(size) {
  // density scales the SVG rasteriser; rendering at 4x and downsampling keeps
  // the serif stems from aliasing into mush at 16px.
  const scale = 4;
  return sharp(Buffer.from(markSvg(size * scale)))
    .resize(size, size, { fit: "fill", kernel: "lanczos3" })
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toBuffer();
}

/** Packs PNG buffers into a multi-image ICO. */
function packIco(images) {
  const HEADER = 6;
  const ENTRY = 16;

  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = HEADER + ENTRY * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(ENTRY);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette size, 0 = truecolour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  const images = [];
  for (const size of SIZES) {
    images.push({ size, data: await renderPng(size) });
  }

  const ico = packIco(images);
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, ico);

  const magic = [...ico.subarray(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
  console.log(`wrote ${path.relative(REPO_ROOT, OUTPUT)}`);
  console.log(`  sizes:  ${SIZES.map((s) => `${s}x${s}`).join(", ")}`);
  console.log(`  header: ${magic} (expect 00 00 01 00)`);
  console.log(`  bytes:  ${ico.length}`);
  for (const { size, data } of images) {
    console.log(`  ${size}x${size}: ${data.length} bytes png`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
