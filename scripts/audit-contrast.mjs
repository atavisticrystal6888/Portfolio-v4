#!/usr/bin/env node
/**
 * WCAG 2.2 AA contrast audit for the design tokens (no dependencies).
 *
 * Parses src/styles/tokens.css, resolves var() chains per theme (and per
 * accent palette), composites translucent layers over the surface they sit
 * on, and checks every text-on-surface pair the components actually use.
 *
 *   node scripts/audit-contrast.mjs            # markdown tables, exit 1 on fail
 *   node scripts/audit-contrast.mjs --json     # machine-readable
 *
 * Thresholds: 4.5:1 normal text, 3:1 large text (>=24px, or >=18.66px bold)
 * and 3:1 for UI component boundaries, focus indicators and meaningful icons.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS = readFileSync(resolve(ROOT, "src/styles/tokens.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/* ---------- parse blocks ---------- */
function parseBlocks(css) {
  const blocks = {};
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    let depth = 1;
    let i = re.lastIndex;
    while (depth && i < css.length) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    const body = css.slice(re.lastIndex, i - 1);
    re.lastIndex = i;
    const decls = {};
    let buf = "";
    let paren = 0;
    for (const ch of body + ";") {
      if (ch === "(") paren++;
      if (ch === ")") paren--;
      if (ch === ";" && paren === 0) {
        const idx = buf.indexOf(":");
        if (idx > 0) {
          const k = buf.slice(0, idx).trim();
          if (k.startsWith("--")) decls[k] = buf.slice(idx + 1).trim();
        }
        buf = "";
      } else buf += ch;
    }
    blocks[selector] = { ...(blocks[selector] || {}), ...decls };
  }
  return blocks;
}
const BLOCKS = parseBlocks(CSS);

function scope(theme, palette) {
  const s = { ...BLOCKS[":root"], ...BLOCKS[`[data-theme="${theme}"]`] };
  if (palette && palette !== "teal") {
    Object.assign(s, BLOCKS[`[data-palette="${palette}"]`] || {});
    Object.assign(s, BLOCKS[`[data-theme="${theme}"][data-palette="${palette}"]`] || {});
  }
  return s;
}

/* ---------- colour maths ---------- */
function resolveVar(value, vars, seen = new Set()) {
  return value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g,
    (_, name, fb) => {
      if (seen.has(name)) throw new Error(`cycle at ${name}`);
      if (vars[name] !== undefined)
        return resolveVar(vars[name], vars, new Set([...seen, name]));
      if (fb !== undefined) return resolveVar(fb.trim(), vars, seen);
      throw new Error(`unresolved ${name}`);
    },
  );
}

function parseColor(str) {
  str = str.trim().toLowerCase();
  let m = str.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = str.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  }
  if (str === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (str === "white") return { r: 255, g: 255, b: 255, a: 1 };
  if (str === "black") return { r: 0, g: 0, b: 0, a: 1 };
  throw new Error(`cannot parse colour "${str}"`);
}

const over = (top, under) => {
  const a = top.a + under.a * (1 - top.a);
  const mix = (k) => (top[k] * top.a + under[k] * under.a * (1 - top.a)) / (a || 1);
  return { r: mix("r"), g: mix("g"), b: mix("b"), a };
};

const lum = ({ r, g, b }) => {
  const c = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const hex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

function colorOf(token, vars) {
  return token.startsWith("--")
    ? parseColor(resolveVar(`var(${token})`, vars))
    : parseColor(token);
}

/* ---------- pairs actually used ---------- */
// layers: bottom-first background stack; the first entry must be opaque.
// kind: text (4.5), large (3), ui (3: boundaries, focus, meaningful icons).
const P = (group, fg, layers, kind, where) => ({ group, fg, layers, kind, where });
const SURFACES = [["--bg"], ["--surface"], ["--surface-raised"]];
const PAIRS = [
  // Body copy and headings
  ...["--text-strong", "--text-body", "--text", "--text-muted"].flatMap((fg) =>
    SURFACES.map((l) => P("text", fg, l, "text", "body copy, headings, cards, modal")),
  ),
  P("text", "--text-muted", ["--surface-hover"], "text", "row / ghost hover"),
  P("text", "--text-strong", ["--surface-hover"], "text", "Button ghost:hover"),
  P("text", "--text-muted", ["--bg", "--nav-bg"], "text", "Navbar links over the translucent bar"),
  // Links
  P("link", "--accent", ["--bg"], "text", "a { color: var(--accent) }"),
  P("link", "--accent", ["--surface"], "text", "links inside cards"),
  P("link", "--accent", ["--surface-raised"], "text", "command palette / modal links"),
  P("link", "--accent-hover", ["--bg"], "text", "a:hover"),
  P("link", "--accent-hover", ["--surface"], "text", "a:hover in cards"),
  P("link", "--accent", ["--bg", "--accent-subtle"], "text", "Button secondary:hover, Lab callout"),
  // Placeholder (base.css sets ::placeholder to --text-muted)
  P("placeholder", "--text-muted", ["--surface"], "text", "contact form inputs"),
  P("placeholder", "--text-muted", ["--surface-raised"], "text", "command palette input"),
  // Chips and badges
  P("chip", "--text-muted", ["--bg", "--chip-bg"], "text", "Badge default, filter chips"),
  P("chip", "--text-muted", ["--surface", "--chip-bg"], "text", "Badge default inside cards"),
  P("chip", "--text-strong", ["--surface", "--chip-bg"], "text", "status pill: live"),
  P("chip", "--badge-current-text", ["--bg", "--badge-current-bg"], "text", "Badge accent, status pill: pilot-ready"),
  P("chip", "--badge-current-text", ["--surface", "--badge-current-bg"], "text", "Badge accent inside cards"),
  P("chip", "--metric", ["--bg", "--metric-bg"], "text", "Badge metric"),
  P("chip", "--metric", ["--surface", "--metric-bg"], "text", "metric readouts in cards"),
  // Status colours
  ...["--success", "--error", "--info"].flatMap((fg) => [
    P("status", fg, ["--bg"], "text", "form messages, decision-log status"),
    P("status", fg, ["--surface"], "text", "status text inside cards"),
  ]),
  P("status", "--success", ["--bg", "rgba(74, 222, 128, 0.15)"], "text", "Toast success (tint from Toast.module.css)"),
  P("status", "--error", ["--bg", "rgba(248, 113, 113, 0.15)"], "text", "Toast error"),
  P("status", "--info", ["--bg", "rgba(96, 165, 250, 0.15)"], "text", "Toast info"),
  // Buttons
  P("button", "--bg", ["--accent"], "text", "Button primary, ::selection"),
  P("button", "--bg", ["--accent-hover"], "text", "Button primary:hover"),
  P("button", "--accent-contrast", ["--accent"], "text", "skip link, active filter chip"),
  // Code
  P("code", "--code-text", ["--code-bg"], "text", "inline code and pre blocks"),
  // Non-text: focus indicator, control boundaries, meaningful icons
  P("ui", "--accent", ["--bg"], "ui", ":focus-visible outline on page"),
  P("ui", "--accent", ["--surface"], "ui", ":focus-visible outline in cards"),
  P("ui", "--border-control", ["--bg"], "ui", "form control boundary token"),
  P("ui", "--border-control", ["--surface"], "ui", "form control boundary on a card"),
  P("ui", "--callout-tip-icon", ["--bg", "--callout-tip-bg"], "ui", "article callout icon"),
  P("ui", "--callout-warning-icon", ["--bg", "--callout-warning-bg"], "ui", "article callout icon"),
  P("ui", "--callout-info-icon", ["--bg", "--callout-info-bg"], "ui", "article callout icon"),
];

// Pairs looked at on purpose and excused, with the reason.
const EXEMPT = [
  ["`--border` / `--border-strong` / `--hairline` on any surface", "Decorative section rules and card hairlines; no control is identified by them alone. Form inputs should use `--border-control`."],
  ["`--chip-border` around chips and filter buttons", "Controls identified by their text label; WCAG 1.4.11 does not require a boundary when the text identifies the control."],
  ["`--code-comment`, `--code-keyword`, `--code-string`, `--code-function`, `--code-number`", "Not referenced by any stylesheet (no syntax highlighter ships). Re-audit if one is added."],
  ["`--process-step-1..4`, `--process-connector`", "Not referenced by any stylesheet."],
  ["ScrollProgress fill (`--accent` bar)", "Decorative and `aria-hidden`; scroll position is also given by the native scrollbar."],
  ["`--gradient-*`, `--shadow-*`, `--accent-glow`", "Decorative; text is measured against the flat surface underneath (gradient alpha <= 0.09)."],
];

const PALETTES = ["teal", "ocean", "emerald", "amber", "mono"];
const THEMES = ["dark", "light"];
const need = (kind) => (kind === "text" ? 4.5 : 3);

function evaluate(theme, palette) {
  const vars = scope(theme, palette);
  return PAIRS.map((p) => {
    try {
      let bg = colorOf(p.layers[0], vars);
      if (bg.a < 1) throw new Error(`base layer ${p.layers[0]} is translucent`);
      for (const l of p.layers.slice(1)) bg = over(colorOf(l, vars), bg);
      const fg = over(colorOf(p.fg, vars), bg);
      const r = ratio(fg, bg);
      const required = need(p.kind);
      return { theme, palette, ...p, fgHex: hex(fg), bgHex: hex(bg), ratio: r, required, pass: r >= required };
    } catch (e) {
      return { theme, palette, ...p, error: e.message, ratio: 0, required: need(p.kind), pass: false };
    }
  });
}

const rows = THEMES.flatMap((t) => evaluate(t, "teal"));
// Palettes are user-selectable in the theme menu, so the accent-driven pairs
// are re-run for each of them (every other pair is identical to teal).
const ACCENT_TOKENS = /accent|badge-current|metric/;
const paletteRows = THEMES.flatMap((t) =>
  PALETTES.slice(1).flatMap((pal) =>
    evaluate(t, pal).filter(
      (r) => ACCENT_TOKENS.test(r.fg) || r.layers.some((l) => ACCENT_TOKENS.test(l)),
    ),
  ),
);

const all = [...rows, ...paletteRows];
const failures = all.filter((r) => !r.pass);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ rows, paletteRows, exempt: EXEMPT, failures: failures.length }, null, 2));
} else {
  const fmt = (r) => `${r.ratio.toFixed(2)}:1`;
  console.log("| Theme | Group | Foreground | Background | Resolved | Ratio | Required | Result | Used by |");
  console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of rows) {
    console.log(
      `| ${r.theme} | ${r.group} | \`${r.fg}\` | \`${r.layers.join(" + ")}\` | ${r.error ?? `${r.fgHex} on ${r.bgHex}`} | ${fmt(r)} | ${r.required}:1 | ${r.pass ? "pass" : "**FAIL**"} | ${r.where} |`,
    );
  }
  console.log("\n**Accent palettes** (theme-menu options; accent-driven pairs only)\n");
  console.log("| Theme | Palette | Pairs | Lowest | Failures |");
  console.log("| --- | --- | --- | --- | --- |");
  for (const t of THEMES)
    for (const pal of PALETTES.slice(1)) {
      const set = paletteRows.filter((r) => r.theme === t && r.palette === pal);
      const low = set.reduce((a, b) => (b.ratio < a.ratio ? b : a));
      const bad = set.filter((r) => !r.pass);
      console.log(
        `| ${t} | ${pal} | ${set.length} | ${fmt(low)} (\`${low.fg}\` on \`${low.layers.join(" + ")}\`) | ${
          bad.length ? bad.map((b) => `\`${b.fg}\` on \`${b.layers.join(" + ")}\` ${fmt(b)}`).join("; ") : "none"
        } |`,
      );
    }
  console.log("\n**Exempt**\n");
  console.log("| Pair | Reason |");
  console.log("| --- | --- |");
  for (const [pair, why] of EXEMPT) console.log(`| ${pair} | ${why} |`);
  console.log(`\n${all.length - failures.length}/${all.length} pairs pass; ${failures.length} fail.`);
}
process.exit(failures.length ? 1 : 0);
