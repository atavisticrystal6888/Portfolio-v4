import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Intrinsic pixel size of an image under `public/`, read from its header at
 * render time (build time for static pages). Case-study images are lazy, so
 * without width/height the browser reserves 0px until they load; chapter
 * jumps then land short and the layout shifts. Server-only: uses `fs`.
 */
export interface ImageSize {
  width: number;
  height: number;
}

const cache = new Map<string, ImageSize | null>();

export function getPublicImageSize(src: string): ImageSize | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null;
  const clean = src.split(/[?#]/)[0] ?? src;
  if (cache.has(clean)) return cache.get(clean) ?? null;
  let size: ImageSize | null = null;
  try {
    const file = path.join(process.cwd(), "public", decodeURIComponent(clean));
    size = parseImageSize(readFileSync(file));
  } catch {
    size = null;
  }
  cache.set(clean, size);
  return size;
}

export function parseImageSize(buf: Buffer): ImageSize | null {
  if (buf.length < 24) return parseSvg(buf);
  // PNG: signature, then IHDR width/height (big-endian) at 16/20.
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return valid(buf.readUInt32BE(16), buf.readUInt32BE(20));
  }
  // GIF: logical screen size (little-endian) at 6/8.
  if (buf.toString("ascii", 0, 3) === "GIF") {
    return valid(buf.readUInt16LE(6), buf.readUInt16LE(8));
  }
  // WebP: RIFF....WEBP then a VP8 / VP8L / VP8X chunk.
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return valid(1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3));
    }
    if (chunk === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return valid(1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff));
    }
    if (chunk === "VP8 ") {
      return valid(buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff);
    }
    return null;
  }
  // JPEG: walk segments to the first start-of-frame marker.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) return null;
      const marker = buf[offset + 1] ?? 0;
      const length = buf.readUInt16BE(offset + 2);
      const isSof =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) {
        return valid(buf.readUInt16BE(offset + 7), buf.readUInt16BE(offset + 5));
      }
      offset += 2 + length;
    }
    return null;
  }
  return parseSvg(buf);
}

function parseSvg(buf: Buffer): ImageSize | null {
  const head = buf.toString("utf8", 0, Math.min(buf.length, 4096));
  const tag = head.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) return null;
  const num = (name: string) => {
    const m = tag.match(new RegExp(`\s${name}=["']\s*([\d.]+)(px)?\s*["']`, "i"));
    return m ? Number(m[1]) : NaN;
  };
  const w = num("width");
  const h = num("height");
  if (w > 0 && h > 0) return valid(Math.round(w), Math.round(h));
  const vb = tag.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i);
  if (vb) return valid(Math.round(Number(vb[1])), Math.round(Number(vb[2])));
  return null;
}

function valid(width: number, height: number): ImageSize | null {
  return width > 0 && height > 0 ? { width, height } : null;
}
