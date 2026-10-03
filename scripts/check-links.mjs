#!/usr/bin/env node
/**
 * Link check (Lane V, 2026-09-30). Requires a running server.
 *
 *   BASE_URL=http://localhost:3100 node scripts/check-links.mjs
 *
 * For every route in tests/e2e/route-manifest.ts: fetch the rendered HTML,
 * collect local href / src / srcset URLs (a /_next/image URL is checked as is
 * AND as its decoded source file), GET each unique URL once and record the
 * status. Non-200 local URLs fail the run. External http(s) links are HEAD-
 * requested with an 8 s timeout and recorded for information only.
 * Output: tmp/pm-candidate-20260930/links.json
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100";
const OUT = path.join(ROOT, "tmp/pm-candidate-20260930/links.json");
const SKIP_EXTERNAL = process.argv.includes("--no-external");

function loadManifest() {
  const src = fs.readFileSync(path.join(ROOT, "tests/e2e/route-manifest.ts"), "utf8");
  const m = src.match(/export const ROUTES: RouteEntry\[\] = (\[[\s\S]*?\n\]);/);
  if (!m) throw new Error("run npm run routes:manifest first");
  return JSON.parse(m[1]);
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function extract(html) {
  const urls = new Set();
  // Only real attributes of real tags: drop inline scripts (RSC payload) first.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  for (const m of markup.matchAll(/\s(href|src)=("([^"]*)"|'([^']*)')/gi)) urls.add(decode(m[3] ?? m[4] ?? ""));
  for (const m of markup.matchAll(/\s(srcset|imagesrcset)=("([^"]*)"|'([^']*)')/gi)) {
    for (const part of decode(m[3] ?? m[4] ?? "").split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (u) urls.add(u);
    }
  }
  return [...urls].filter(Boolean);
}

function classify(u) {
  if (/^(mailto|tel|javascript|data|blob):/i.test(u) || u.startsWith("#")) return null;
  if (u.startsWith("//")) return { kind: "external", url: `https:${u}` };
  if (/^https?:\/\//i.test(u)) {
    const url = new URL(u);
    if (url.origin === new URL(BASE).origin) return { kind: "local", url: url.pathname + url.search };
    return { kind: "external", url: u };
  }
  if (u.startsWith("/")) return { kind: "local", url: u.split("#")[0] };
  return null;
}

async function withTimeout(fn, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fn(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const routes = loadManifest();
  const local = new Map(); // url -> Set(foundOn)
  const external = new Map();
  const pages = [];
  const add = (map, url, on) => {
    if (!map.has(url)) map.set(url, new Set());
    map.get(url).add(on);
  };

  for (const r of routes) {
    const res = await fetch(BASE + r.path);
    const html = await res.text();
    pages.push({ path: r.path, status: res.status, expected: r.expectStatus });
    for (const raw of extract(html)) {
      const c = classify(raw);
      if (!c) continue;
      if (c.kind === "local") {
        add(local, c.url, r.path);
        if (c.url.startsWith("/_next/image")) {
          const src = new URL(BASE + c.url).searchParams.get("url");
          if (src) add(local, src, `${r.path} (decoded /_next/image)`);
        }
      } else add(external, c.url, r.path);
    }
  }

  const localResults = [];
  for (const [url, on] of local) {
    let status;
    try {
      const res = await withTimeout((signal) => fetch(BASE + url, { signal, redirect: "follow" }), 20_000);
      status = res.status;
      await res.arrayBuffer();
    } catch (e) {
      status = `error: ${e.name}`;
    }
    localResults.push({ url, status, foundOn: [...on].slice(0, 5), foundOnCount: on.size });
  }

  const externalResults = [];
  if (!SKIP_EXTERNAL) {
    const list = [...external.keys()];
    let i = 0;
    await Promise.all(
      Array.from({ length: 6 }, async () => {
        while (i < list.length) {
          const url = list[i++];
          let status;
          try {
            const res = await withTimeout((signal) => fetch(url, { method: "HEAD", signal, redirect: "follow" }), 8_000);
            status = res.status;
          } catch (e) {
            status = `error: ${e.name === "AbortError" ? "timeout" : e.cause?.code || e.name}`;
          }
          externalResults.push({ url, status, foundOn: [...external.get(url)].slice(0, 5) });
        }
      })
    );
    externalResults.sort((a, b) => a.url.localeCompare(b.url));
  }

  const pageFailures = pages.filter((p) => p.status !== p.expected);
  const localFailures = localResults.filter((l) => l.status !== 200);
  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    routes: pages.length,
    pageFailures,
    local: { unique: localResults.length, failures: localFailures, results: localResults },
    external: {
      informational: true,
      unique: externalResults.length,
      non2xx: externalResults.filter((e) => !(typeof e.status === "number" && e.status < 400)),
      results: externalResults,
    },
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(
    `routes ${pages.length} (page failures ${pageFailures.length}); local URLs ${localResults.length}, non-200 ${localFailures.length}; external ${externalResults.length}, non-2xx/3xx ${report.external.non2xx.length} (informational)`
  );
  for (const f of [...pageFailures.map((p) => `PAGE ${p.path} ${p.status}`), ...localFailures.map((l) => `LOCAL ${l.url} ${l.status} on ${l.foundOn[0]}`)]) console.log(`  ${f}`);
  if (pageFailures.length || localFailures.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
