/**
 * Broken Link Checker
 * Crawls the built site and validates all internal + external links.
 * Usage: npx tsx scripts/check-links.ts
 */

import { execSync, spawn, type ChildProcess } from "child_process";
import http from "http";
import https from "https";

const BASE = "http://localhost";
let port = 3000;
let serverProcess: ChildProcess | null = null;

interface LinkResult {
  source: string;
  href: string;
  status: number | "timeout" | "error";
}

const visited = new Set<string>();
const broken: LinkResult[] = [];
let linksChecked = 0;

function get(url: string, timeout = 10000): Promise<number> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location, timeout).then(resolve).catch(reject);
        res.resume();
        return;
      }
      res.resume();
      resolve(res.statusCode || 0);
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.on("error", reject);
  });
}

async function crawl(path: string) {
  const normalizedPath = path.split("?")[0]!.split("#")[0]!;
  if (visited.has(normalizedPath)) return;
  visited.add(normalizedPath);

  const url = `${BASE}:${port}${normalizedPath}`;
  let html: string;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      broken.push({ source: normalizedPath, href: normalizedPath, status: res.status });
      return;
    }
    html = await res.text();
  } catch {
    broken.push({ source: normalizedPath, href: normalizedPath, status: "error" });
    return;
  }

  // Extract links
  const hrefRegex = /(?:href|src)=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  const links: string[] = [];

  while ((match = hrefRegex.exec(html)) !== null) {
    links.push(match[1]!);
  }

  for (const href of links) {
    linksChecked++;

    // Skip anchors, data URIs, javascript:, mailto:
    if (href.startsWith("#") || href.startsWith("data:") || href.startsWith("javascript:") || href.startsWith("mailto:")) {
      continue;
    }

    // Internal link
    if (href.startsWith("/") || href.startsWith(BASE)) {
      const internalPath = href.startsWith("/") ? href : new URL(href).pathname;
      // Skip static files
      if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|json)$/i.test(internalPath)) {
        continue;
      }
      await crawl(internalPath);
    } else if (href.startsWith("http://") || href.startsWith("https://")) {
      // External link - just validate status
      try {
        const status = await get(href);
        if (status >= 400) {
          broken.push({ source: normalizedPath, href, status });
        }
      } catch (err) {
        broken.push({
          source: normalizedPath,
          href,
          status: (err as Error).message === "timeout" ? "timeout" : "error",
        });
      }
    }
  }
}

async function main() {
  console.log("🔗 Starting broken link checker...\n");

  // Find a free port
  port = 3000 + Math.floor(Math.random() * 1000);

  // Start server
  serverProcess = spawn("npx", ["next", "start", "-p", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  // Wait for server to be ready
  await new Promise<void>((resolve) => {
    const onData = (data: Buffer) => {
      if (data.toString().includes("Ready")) {
        serverProcess?.stdout?.off("data", onData);
        resolve();
      }
    };
    serverProcess?.stdout?.on("data", onData);
    // Fallback timeout
    setTimeout(resolve, 15000);
  });

  console.log(`Server running on port ${port}\n`);

  // Crawl starting from root
  await crawl("/");

  // Report
  console.log(`\n📊 Results:`);
  console.log(`   Pages crawled: ${visited.size}`);
  console.log(`   Links checked: ${linksChecked}`);
  console.log(`   Broken links:  ${broken.length}`);

  if (broken.length > 0) {
    console.log(`\n❌ Broken links:\n`);
    for (const b of broken) {
      console.log(`   [${b.status}] ${b.href}`);
      console.log(`     Found on: ${b.source}\n`);
    }
  } else {
    console.log(`\n✅ No broken links found!`);
  }

  // Cleanup
  serverProcess?.kill();
  process.exit(broken.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  serverProcess?.kill();
  process.exit(1);
});
