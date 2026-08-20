# Handover: Portfolio round 2 — projects media, About story, Lab fix, UI push

## State

Planning session only — nothing implemented yet. Four workstreams, all PENDING:

**WS1 — Project images, live links, better descriptions** (`content/projects.json`)
The `Project` type (src/types/project.ts) already supports `imageUrl`, `imageAlt`, `liveUrl`, `githubUrl`; ProjectCard (src/components/projects/ProjectCard.tsx) already renders editorial rows with alternating screenshots. Only data is missing. Current gaps:

| slug | image | liveUrl | githubUrl | local source |
|---|---|---|---|---|
| aarchid | ✅ | ✅ aarchid.space | ✅ | — |
| tcs-nqt-prep-hub | ✅ | ✅ github.io | ✅ | — |
| portfolio-site | ✅ | — (self) | ✅ | this repo |
| hackmate | ❌ | none (user did NOT select it as deployed) | ✅ | none |
| kite-edge | ❌ | local only | ❌ | `D:\Dhruv-Personal\Wipro-old\Kite-edge` |
| experiment-hub | ❌ | local only | ✅ | `D:\Dhruv-Personal\Wipro-old\A-B-Testing-Platform` |
| desktasks | ❌ | ✅ https://desktasks.vercel.app (found in Task-manager repo) | ❌ | `D:\Dhruv-Personal\Side-Projects\Task-manager` |
| better-half | ❌ | URL claimed; Vercel project name "tracker" (`Tracker/.vercel/project.json`) — get exact URL via `vercel` CLI or ask | ❌ | `D:\Dhruv-Personal\Side-Projects\Tracker` |
| weekly-retro | ❌ | ✅ https://dashboard-her.vercel.app (found in Dashboard-her README) | ❌ | `D:\Dhruv-Personal\Side-Projects\Dashboard-her` |
| churn-analysis | ❌ | — | ✅ | Power BI, no app; skip image unless user provides export |
| sku-pipeline, brand-tech-scanner | ❌ | — | ❌ | card-only entries (hasCaseStudy:false) |

Plan: run each local app with **demo/seed data only** (user-mandated — Better-Half and
Weekly Retro contain real personal/relationship data; none of it may land in the public
portfolio), Playwright-screenshot at ~1600px 16:10 dark theme, optimize <300KB PNG,
save `public/images/projects/<slug>/hero.png`, set imageUrl+imageAlt. Kite-edge and
ExperimentHub are heavy polyglot stacks (13 compose services / Kafka) — before trying to
run them, check `D:\Dhruv-Personal\Wipro-old\kite recommendation images\` (7 WhatsApp
.jpegs dated 2026-08-12 — possibly KiteEdge screens; view before using, and only use if
they're clean product shots) — neither repo has committed screenshots. githubUrls for kite-edge, desktasks, better-half (and
weekly-retro) are DELIBERATELY absent — those repos are private and the user chose link
removal on 2026-08-16; do NOT re-add them. Better-Half is also deliberately anonymised
(generic "long-distance couples" framing) — screenshots and copy must not identify the
couple. Descriptions: light editorial pass — lead with the user
outcome, ≤2 sentences, kill "[In active development]" bracket in kite-edge (move status
to the duration/meta line), keep every real metric verbatim.

**WS2 — About "My story"** (src/app/about/page.tsx:74-94)
Current bio is a resume paragraph ("Final-year B.Tech student with operating experience
across..."). Rewrite as a 3–4 paragraph narrative: a thesis (he learns domains by
building in them — PRD + eval set + ship v1 himself), the arc Wipro TOPS → Read Riches →
Omniful.ai → The Sleep Company with one concrete texture detail per stop, and surface the
buried anecdotes (killed 37 low-signal dashboard charts at Wipro, kept the 3 that drove
decisions — currently hidden at page.tsx:165). Facts only — do not invent metrics or
events; every claim must already exist in this repo's content. Also tighten templated
section titles ("What I bring", "Where I've been") while in the file.

**WS3 — Lab "By domain" doesn't work** (src/app/lab/page.tsx:45-59)
Diagnosis confirmed: the By-domain cards are static count tiles — no click, no filter;
that's the "doesn't work". Fix: extract the two sections into a client component
(`src/components/lab/LabMatrix.tsx`), domain cards become filter buttons ("All" +
categories, aria-pressed, keyboard focusable) filtering the sorted matrix below. Keep
page.tsx a server component (metadata/JsonLd stay). Data: content/lab/ideas.json, 12
ideas, categories incl. AI Infra / AI Tooling / Data Product / AI Product.

**WS4 — "UI can be drastically improved, a revamp can still be done"**
The round-1 editorial revamp plan WAS already executed by a prior session (git log
f97067b..8ed00d0: editorial shell, dossier headers, GlassCard→Surface, DiagonalDivider
retired, reveals stripped). Round 2 must be critique-first, not plan-replay:
1. `npm run dev`, Playwright-screenshot home/projects/case-study/blog/about/lab at
   1440px + 375px, dark + light.
2. Critique against `.claude/skills/frontend-design/SKILL.md`; implement in small
   verified commits. Known candidates from this session's recon: hero still carries
   particles + Three.js + custom cursor + loading screen + oneko (user said round 1
   "keep for now, revisit later" — this is the revisit: recommend removal/toning, but
   ASK before deleting); newly-added project screenshots should reshape the projects
   listing and dossier heroes (wire heroImage into CaseStudyHero); type conviction at
   display sizes; remaining templated headings; ListRow hover/focus micro-states;
   light-theme parity.

## Decisions (user-dictated, do not re-litigate)
- This split: planning here, execution by Opus 5 in a fresh session.
- Direction stays the round-1 hybrid: editorial product-dossier evolved from the
  dark/teal identity; signature = mono spec tables + typographic metric strips.
- Screenshots: demo/seed data only, never real personal data.
- Hackmate gets no live link. Kite-Edge and ExperimentHub are local-only.
- Content substance (metrics, testimonials) is never rewritten, only presentation/copy.
- New styles use existing CSS vars only — light theme + 4 palette swaps must keep working.

## Files (load-bearing)
- content/projects.json — single source for WS1 fields
- src/types/project.ts — Project/CaseStudy types (imageUrl/liveUrl/githubUrl exist)
- src/components/projects/ProjectCard.tsx — already image-aware editorial rows
- src/app/about/page.tsx — WS2 bio + section titles
- src/app/lab/page.tsx — WS3; styles in src/styles/content-page.module.css
- src/styles/tokens.css — round-1 token system (type scale, hairlines, --section-gap)
- .claude/skills/ — 22 skills copied in: use executing-plans, frontend-design,
  verification-before-completion, systematic-debugging

## Gotchas
- `gh` CLI is NOT installed; verify repo visibility with curl/WebFetch instead.
- Windows; Bash tool is Git Bash, PowerShell is 5.1 (no `&&`). Grep across
  Side-Projects hangs on node_modules — always exclude it or use the Grep tool.
- Stage by explicit path only (never `git add -A`); parallel sessions share this tree.
- Tests: `npx playwright test` runs 5 browser profiles; touch-targets spec needs ≥44px
  hit areas on any new interactive element (Lab filter buttons!); responsive spec at 375px.
  Running all 5 browser projects in parallel locally can flake WebKit a11y checks under
  CPU load — run projects separately for a clean local pass. Contact API tests are
  chromium-only (route rate limit).
- Round-1 plan file `C:\Users\Dhruv Singhal\.claude\plans\robust-weaving-lagoon.md` is
  DONE — do not re-execute it.

## Next prompt (paste into fresh Opus 5 session in this repo)

> Read handover-portfolio-round2.md fully, then content/projects.json,
> src/app/lab/page.tsx, and src/app/about/page.tsx. Confirm orientation in ≤10 lines.
> Then execute the four workstreams in this order, committing per workstream:
> WS3 (Lab filter fix — smallest, ship first), WS1 (images/links/descriptions — ask me
> for the Better-Half live URL when you get there), WS2 (About story
> rewrite — show me the draft before committing), WS4 (UI critique + improvements —
> screenshot first, propose, then implement; ask before touching the interactive
> extras). Run `npx playwright test` after each workstream and fix failures before
> moving on.

---

# Round 3 — de-AI the last tells, realism pass, all pages

Executed 2026-08-20 from `C:\Users\Dhruv Singhal\.claude\plans\robust-weaving-lagoon.md`
(that path was reused for the round-3 plan; its round-1 contents are gone). Nine commits,
`996f619..32634b9`. Sections A and B are done. Section C is done except the
per-case-study artifacts, which need you.

## What shipped

| Commit | What |
|---|---|
| `c19bd0e` + `c88b558` | **A5.** `markdownToHtml` only understood `*emphasis*`, so `_your_` printed raw in the Aarchid body. Added `_em_` / `__strong__` with the CommonMark intraword rule (snake_case survives) behind a tag-aware splitter. The splitter in the first commit matched `<[^>]*>`, which a bare `P95 <10s` in prose turned into a fake tag — that ate the emphasis pass over the rest of the document and left `**Unit economics:**` on screen. The second commit requires `</?` plus a letter. Lab card asterisks were stripped from `ideas.json` instead (plain-text fields, not markdown). `tests/unit/markdown.test.ts` added. |
| `3a677cb` | **A1/A3/A8.** Gradient off "Singhal". "Open to Opportunities" chip becomes a real status line; "Explore Work" / "Get in Touch" become "See the work" / "Email me"; the nav CTA is deleted; the closing section says something. Hero `min-height: 90vh` becomes `min(78vh, 620px)`, so the metrics strip lands in the first scroll. The scroll-hint mouse is gone (it anchored to the text column, so it read as a stray dot floating beside the globe), and with it the now-unused `.text-gradient` utility and `scrollDot` keyframe. The `--gradient-text` tokens stay defined in all six palettes. |
| `8482ef2` | **A2.** The globe stays and stops landing on text. Lab: the header stage reserves the scene's column and holds itself open to its height; the ambient box is square now (it mixed a `%` width with a `vw` height, so on a fixed-width content page it came out taller than wide and the camera cropped the lattice sideways). Case studies: where the header has a screenshot the screenshot wins and no scene renders; where it does not, the scene sits in the gutter beside the centred spec table, and only from 1100px up where that gutter fits the whole figure. |
| `2ed55a3` | **A4.** 202 dashes across case studies and blog posts, 8 project names, 75 lines of JSX copy. Date ranges take an en dash; changelog version labels take a middot. Fenced and inline code untouched. The diff is 259 insertions / 259 deletions — character swaps only, no claim changed. |
| `190f22d` | **A6/A7.** Twelve Lab categories become four that each hold more than one (AI Infra & Tooling 4, Vertical AI 3, Personal Ops 3, Data & Analytics 2). The "By domain" count-tile grid becomes a chip row directly above the matrix. Lab cards drop the all-caps category-plus-PM-skill rail for one sentence-case line. Blog index rows drop tags entirely (still searched, still shown on the post page). `tests/e2e/lab.spec.ts` rewritten for the chip markup. |
| `e1a843b` | Two rendering defects found by walking the built pages: `/now` read "APMroles" and every footer read "© 2026Dhruv Singhal." Same JSX rule both times — a text node that wraps onto another line loses its leading space. A DOM sweep over all 22 routes found no third case. The footer regroups from 11-in-a-column into Work / More / Connect, and the brand block gains **C4**: "Last updated &lt;date&gt; · changelog", read from the changelog data, which moved to `src/lib/changelog.ts`. Also fixed the changelog page arguing with itself (Phase 3 sat under "What's next" while `v4.3 · Phase 3` sat above it marked Shipped) and `/now`'s "3D Aarchid hero", which stopped existing in round 2. |
| `9af9bd6` | Four generic blog deks rewritten using lines already inside each post. The contact header comes off the template vocabulary. `Read the case study →` in caps mono on every project row becomes "Case study →". `Aarkid` becomes `Aarchid` in `ideas.json`. Re-shot the portfolio's own three screenshots — they still showed the gradient hero and the old nav CTA, so `/projects` was advertising a site that no longer exists. |
| `32634b9` | **C1** portrait beside the closing CTA on the home page (not the hero — you chose "lower on the page"). **C2** KiteEdge image, see below. |

## Decisions you made this round (do not re-litigate)

- Hackmate: **no screenshot, text-only row.**
- Churn Analysis: **no Power BI export, text-only row.**
- C3 per-case-study artifacts: **deferred to a later round.**
- Home-page photo: **yes, lower on the page**, not in the hero.
- KiteEdge: **use the analytics-engine API shot** (next section).

## KiteEdge — why there is no dashboard screenshot

`D:\Dhruv-Personal\Wipro-old\Kite-edge` cannot produce one honestly:

- `kiteedge_postgres_data` holds **17 rows in `holdings_current` and 1 `linked_kite_accounts` row** — real personal financial data from a real Zerodha login. None of it may go on a public site.
- `dashboard/src/components/auth/RequireAuth.tsx` gates every route on `/auth/status` returning `authenticated: true`, which only a real Kite OAuth session produces. `apps/kite_edge/priv/repo/seeds.exs` seeds trading calendars, instrument masters and default profiles — **no demo portfolio**. So there is no demo-data path to a populated dashboard without patching the app, which would manufacture a state no real run reached.
- What shipped instead: `public/images/projects/kite-edge/analytics-api.png`, the analytics engine's own OpenAPI docs captured from the service running locally on :8001. It evidences the case study's real claims (VaR, Monte Carlo, stress test, correlation, forecasting) and contains no account data.
- `docker compose up -d analytics_engine` is enough for that shot, and that service does **not** receive `.env.kite`. Do not start `market_data`, `market_feed`, or the schedulers — those carry the Kite credentials and hit live APIs. Postgres and Redis were already running on this machine before round 3 and were left running; the analytics_engine container was removed afterwards.

## Gotchas found this round

- **JSX eats a leading space** when a text node wraps to the next line. Use `{" "}`. Source greps over-report this badly; the reliable check is a DOM walk over the built pages.
- **Long-page screenshots miss lazy images.** A `fullPage` shot taken without scrolling first leaves the last rows blank — a capture artifact, not a site bug. Weekly Retro looked broken for exactly this reason and is fine.
- **Stale dev servers.** Two abandoned Next servers were listening (ports 3000 and 3177, 9 hours old) serving pre-fix HTML. Playwright's `reuseExistingServer` would have silently tested them. Check `Get-NetTCPConnection -LocalPort 3000` before trusting a run.
- **CSS-module specificity across files.** `.card p` in `content-page.module.css` beats a plain `.skill` class from another module. The Lab card's skill line is a `<span>` with `display: block` for that reason.
- `node -e` string replacements silently no-op on CRLF files, and several sources here are CRLF. Use the Edit tool for surgical edits.
- The chromium suite throws roughly one load-related flake per full run (`navigation` and `links` specs). Both pass 12–30/30 when run alone with `--retries=0`. Same class of flake round 2 documented for WebKit.

## Verifying

- `npx vitest run` → 41 pass.
- `npm run build`, then `npm run start`, then `npx playwright test --project=<name>` for each of chromium / firefox / webkit / mobile-chrome / mobile-safari → 118 pass on chromium and 116 on each of the others (the 3 skipped per non-chromium project are the chromium-only contact API tests). Running all five at once still flakes; run them separately.
- Screenshot every route in both themes before believing a layout is fine. Light theme was unverified before this round; it was checked page by page here and needed no fixes.

## Open items

1. **C3 — one imperfect human artifact per case study.** The biggest remaining realism lever, and it can only come from you. Per project, what to dig out:
   - `aarchid` — the actual eval-harness sheet (the 50-photo golden set with accuracy deltas), or the PRD excerpt.
   - `experiment-hub` — the sequential-statistics notebook, or a real experiment readout.
   - `better-half` — the RLS policy test output (575 checks) as a terminal run, anonymised.
   - `desktasks` — the 540+ assertion test run, terminal.
   - `kite-edge` — a QuantStats tear sheet from demo input, or the suggestion-journal schema.
   - `tcs-nqt-prep-hub`, `portfolio-site`, `hackmate`, `churn-analysis` — a hand-drawn flow, a PRD page, or an anonymised user message.

   The treatment to build is a figure with an annotated caption in his voice, not a clean gallery shot.
2. **`sku-pipeline` and `brand-tech-scanner`** still have no image. The plan's own suggestion stands: a terminal run or the Excel output reads more real than a UI shot. Needs the scripts runnable.
3. **`AvailabilityBadge`** (`src/components/contact/AvailabilityBadge.tsx`) is unused dead code and still holds the "Open to Opportunities" string. Nothing renders it, so it is not a visible tell — delete it deliberately or wire it somewhere.
4. **`--gradient-text`** is defined in all six palettes in `tokens.css` and now has no consumer. Left in place so the palettes stay symmetrical.
5. **Changelog v4.2 claims "/lab — 19 product ideas"** while `ideas.json` has 12. It is a historical entry, so it was left alone — confirm which number was true at v4.2.
6. **`handover-portfolio-round2.md` was untracked** before this round; it is committed as part of it.
