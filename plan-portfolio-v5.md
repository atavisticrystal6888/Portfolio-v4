# Plan: Portfolio v5 — research-driven IA & depth release

Compiled 2026-08-22. Inputs: `research-pm-portfolios-2026-08.html` (web research on
trending PM portfolios, committed to this repo), `handover-portfolio-round2.md`
(rounds 1–3 history), and a full codebase map of v4.

## The thesis

**Lane chosen by the user 2026-08-22: the 1+2 hybrid.** v5 is an information-
architecture, curation, and depth release on the v4 codebase — PLUS a bold,
deliberate redesign of exactly **two signature surfaces**: (a) the homepage hero +
Selected Work treatment, and (b) the case-study page anatomy. Everything else
evolves quietly on the existing system. Rationale: the research found portfolios
win on curation, decision-narrative, and real artifacts, not visual novelty; but
the user wants v5 to read unmistakably new — the two surfaces where evaluators
spend their time carry that newness, at a fraction of a full revamp's cost.

v4's shipped identity (working-paper light / night-blueprint dark,
`src/styles/tokens.css`) stays as the foundation — it is distinctive, AA-verified,
and the "editorial product-dossier" register is exactly what the research found
RARE even among standout portfolios ("full problem → approach → metrics
storytelling on the page itself is rare"). The data layer moves wholesale:
`content/` (~30 JSON/MDX files), `src/lib/content.ts`, `src/types/` — untouched
substance, per the standing rule that metrics/testimonials are never rewritten,
only presentation.

**Boldness budget rule:** the two signature surfaces may break v4's current
component grammar (new grid, new display-size type treatment, new figure
treatments) as long as they build FROM tokens.css (extending it is fine; a
parallel token system is not). All other pages change only as the IA demands.
One design language, two loud rooms.

Repo strategy (recommended): evolve in place on a `v5` branch. `package.json` is
already named `portfolio-v5`/5.0.0; rounds 1–3 invested heavily in a11y, tests
(159+ Playwright/Vitest), SEO/JSON-LD, and Lighthouse ≥90 — a fresh repo throws
that away for nothing the research asks for.

## Research findings → v5 decisions (traceability)

| # | Research finding | v5 response |
|---|---|---|
| R1 | 2–3 deep case studies beat many; curation ("Selected Work") itself signals seniority; too many case studies is a named anti-pattern | v4 exposes 9 case studies as peers. v5 introduces a two-tier model: 2–3 **flagship dossiers** + compact cards for the rest (WS-A) |
| R2 | Hiring managers evaluate decisions/trade-offs/constraints, not features; converged skeleton: Context → Problem → Constraints → Process & trade-offs → Solution (your part) → Results + lessons | Audit all 9 MDX against this skeleton; add explicit "Decisions & trade-offs" and "My part" beats where missing (WS-B) |
| R3 | Quantified CAUSAL impact ("shipped X → activation +Y%"), never activity | Metric framing pass: every `metrics[]` entry and TL;DR states cause → effect (WS-B) |
| R4 | Strongest differentiators on live sites: voice + one singular artifact (Hinh's robot archetype) | Round-3 open item C3 ("one imperfect human artifact per case study") is independently validated — promote to a core v5 workstream (WS-C); pick ONE flagship "I build" artifact for the homepage |
| R5 | AI-PM sub-genre: live embedded demos and working AI builds are becoming table stakes; portfolio drifts from artifact to pre-interview screen | Surface live demos (aarchid.space, desktasks.vercel.app, dashboard-her.vercel.app) as first-class proof; strengthen `/ai-pm` (WS-D) |
| R6 | Vague ownership ("contributed to…") reads as padding; misaligned seniority framing is a tell | Ownership lines in every dossier; calibrate language to the level being applied for (WS-B) |
| R7 | Distribution trio: open-web SEO on your name + resume link + LinkedIn Featured (claimed majority of offers) | Distribution checklist as a shippable workstream, not an afterthought (WS-E) |
| R8 | A mediocre extra hurts more than none; slick visuals with no decision trail read as style over substance | Subtraction pass: delete parked interactives + dead code, drop heavy deps if their consumers go (WS-F) |
| R9 | ~40% portfolio adoption in Asia; Indian postings request portfolios directly | Confirms ROI of the whole effort for this user's market. No action, just motivation |
| R10 | Tailoring to target role separates strong from generic | `/ai-pm` becomes the role-targeted entry path; resume variants already exist in `content/resume/` (WS-E) |

## Workstreams

### WS-0 — Signature-surface design pass (NEW, gates WS-A and WS-B)
Before building either signature surface, produce a reviewable design proposal:
1. Screenshot current home + one flagship case study (1440px + 375px, both
   themes) as the "before".
2. Load `.claude/skills/frontend-design` guidance; draft the two surface designs
   as static mockups (coded throwaway pages or annotated wireframes — whichever
   is faster to judge), covering: hero composition, Selected Work grammar,
   dossier anatomy incl. the artifact-figure treatment, display-size type scale.
3. **Show the user the proposal and get a yes before implementation** — this is
   the one place v5 spends real aesthetic risk; it should not land unreviewed.
4. Token additions (if any) specified up front so the light/dark/palette matrix
   stays coherent.

### WS-A — Curation & information architecture (the headline change)
1. **Two-tier projects model.** Add `tier: "flagship" | "selected"` (or reuse
   `featured`) in `content/projects.json`. Flagships get the full dossier route and
   homepage presence; the rest render as compact rows with metric + one-line
   outcome + optional "Case study →". Nothing is deleted — the depth stays
   reachable, the hierarchy changes.
2. **Flagship candidates** (decision needed, recommendation first):
   - `aarchid` — AI product, live at aarchid.space, eval-harness story = the
     strongest "AI PM who ships" proof. **Recommend.**
   - `experiment-hub` — self-hosted A/B platform; deepest technical/statistics
     narrative. **Recommend.**
   - `kite-edge` — richest system (VaR/Monte Carlo) but local-only, no live link,
     screenshot constraints (see round-3 notes). **Recommend as 3rd** OR
     `desktasks` (live URL + 540-assertion test story) if live-demo weight wins.
3. **Homepage restructure + SIGNATURE REDESIGN №1 (hero + Selected Work).**
   Order follows the research's evaluation sequence: hero thesis (who + what I
   ship, status line) → causal-metric proof strip (exists: `MetricsGrid`) →
   Selected Work (2–3 flagships) → "How I think" strip (2 best blog posts:
   `shipping-llm-products-eval-harness`, `why-pms-should-code`) → the singular
   artifact (R4) → testimonials → CTA. Career timeline moves to /about (hiring
   managers scan work first, bio second).
   The redesign brief for this surface (design pass BEFORE build, per WS-0):
   - Hero and Selected Work may abandon the current hero/ProjectCard grammar
     entirely — new grid, display-type conviction, new image treatment.
   - Flagship entries in Selected Work read as openings of dossiers, not cards:
     screenshot + causal metric + "my part" line + live-app link, composed like
     a working-paper front page rather than a portfolio grid.
   - Both themes designed together; AA maintained; built from tokens.css
     (extend tokens if the design needs new ones — do not fork).
4. **Nav rationalization.** `/lab`, `/now`, `/uses`, `/bookshelf`, `/changelog`
   are currently unlinked orphans. Decide per page: keep+link (lab and now have
   research support as "build-in-public" signals — put them under a single
   "More" nav item), or leave orphaned deliberately. Kill nothing silently.

### WS-B — Case-study skeleton, ownership pass + SIGNATURE REDESIGN №2 (dossier anatomy)
This workstream now carries the second bold surface: the **case-study page
anatomy** is redesigned, not just re-sectioned. Design pass before build (WS-0):
- New page skeleton that makes the 6-part narrative VISIBLE as structure: a
  dossier header (title, "my part", causal TL;DR, spec table), a constraints/
  trade-offs treatment that reads differently from body prose (margin notes,
  decision callouts — pick one grammar and use it everywhere), a metrics strip
  tied to the results section, and a reserved slot for the WS-C artifact figure
  with annotated caption (design the figure treatment NOW even though artifact
  content lands later).
- Flagship and compact tiers share the anatomy; compact case studies simply have
  fewer beats — one template, two depths.
- Same guardrails: both themes, AA, tokens.css-derived, `CaseStudyHero` image
  handling from round 2 respected (screenshot beats scene).

Content pass, for each of the 9 MDX dossiers:
1. Map existing H2s onto the 6-part skeleton; add the missing beats — most
   commonly **Constraints** and an explicit **Decisions & trade-offs** section
   (named frameworks where genuinely used; no retrofitting fake RICE).
2. Add a one-line **"My part"** statement near the top (R6) — exact ownership,
   collaborators already credited via `coCreators[]`.
3. Reframe metrics causally (R3): "Built eval harness → accuracy X→Y%" instead of
   bare numbers. `displayValue` fields make this cheap.
4. End every flagship with **Results + what I'd do differently** (the research
   found "lessons/reflection" in every expert skeleton; v4 has it inconsistently).
Rule carried from rounds 1–3: facts only, every claim must already exist in repo
content; this is a framing pass, not a writing-fiction pass.

### WS-C — The human artifacts (round-3 C3, now research-validated)
One imperfect, real artifact per flagship, presented as an annotated figure in the
user's voice — this needs **user-supplied source material**:
- `aarchid`: the 50-photo golden-set eval sheet with accuracy deltas, or PRD excerpt.
- `experiment-hub`: the sequential-statistics notebook or a real experiment readout.
- `kite-edge`: QuantStats tear sheet from demo input (constraints in
  handover-portfolio-round2.md §KiteEdge apply — no real account data, don't start
  the credentialed services).
- Plus, for the homepage (R4): pick THE one artifact that plays the "Hinh's robot"
  role — recommendation: the aarchid eval harness (it is the "AI PM who builds
  evals" story hiring managers currently screen for).
Existing treatment guidance in round-3 notes stands: figure + annotated caption,
not a clean gallery shot. Demo/seed data only — the Better-Half/Weekly-Retro
privacy rules remain absolute.

### WS-D — Live-demo surface & AI-PM path
1. Elevate `liveUrl` in flagship dossiers and project rows: "Open the live app →"
   as a primary action, not a footnote (R5). Live: aarchid.space,
   desktasks.vercel.app, dashboard-her.vercel.app, tcs-nqt github.io.
2. `/ai-pm` becomes the tailored entry (R10): AI shipping proof (aarchid evals,
   LLM blog posts), links the AI-PM resume variant from `content/resume/`.
3. Lab reframe: from idea backlog toward "what I'm building now" — link `/now`
   and lab together as the build-in-public signal. Do NOT fake activity; only
   surface what's real.
4. Stretch (only if WS-A..C land): one small embedded interactive demo on-site.
   Research says embedded artifacts (Figma/Loom/live demos) are increasingly
   expected — but a mediocre embed hurts (R8), so this is opt-in, last.

### WS-E — Distribution (cheap, high-claimed-ROI, mostly outside the repo)
1. Open-web: name-SEO already strong (JSON-LD Person, sitemap, RSS, OG route) —
   verify the "one Person" schema post-`4ebed8b` renders on all flagship routes.
2. Resume ↔ portfolio: resume PDF links to flagship case-study URLs (deep links,
   not just the homepage); portfolio nav already links the PDF.
3. LinkedIn Featured: add the 2–3 flagship case-study URLs + the artifact piece.
   Checklist item for the user — the repo can't do this part.
4. Case-study OG images: ensure `/og/[[...slug]]` output for flagships looks
   share-worthy (they'll be seen in LinkedIn cards).

### WS-F — Subtraction & performance (R8)
1. Delete the four parked interactives (`LoadingScreen`, `CustomCursor`,
   `OnekoCat`, `ParticlesBg`) — `DISABLED-INTERACTIVES.md` is the already-written
   rationale; keep the file as the record. Also delete no-call-site
   `ThemeCustomizer.tsx` and dead `AvailabilityBadge.tsx` (round-3 open item 3).
2. **ASK before removing** (user said "revisit later" — this is the revisit, and
   the decision is theirs): SignatureScene/globe (three + R3F + drei ≈ the
   heaviest dependency cluster), MusicToggle/howler. Research leans "subtract"
   — decoration without decision-trail value — but these are identity choices.
3. If the globe goes: drop three/@react-three/*, howler from package.json; re-run
   Lighthouse; expect the largest single perf win available.
4. Unused fonts (Boska, Satoshi woff2 in public/fonts) — delete.

## Order & verification

Ship order: **WS-0 (design pass, user-approved) → WS-A → WS-B → WS-C (as user
provides artifacts) → WS-D → WS-F → WS-E**, one commit-series per workstream. After each: `npx vitest run` (41 pass baseline),
`npm run build`, Playwright per-project (chromium 118 / others 116 baseline; run
browser projects separately — parallel runs flake, see round-3 notes), screenshot
every touched route in both themes at 1440px + 375px before believing it.

Standing rules (carried forward, do not re-litigate):
- Content substance (metrics, testimonials) never rewritten — presentation only.
- Screenshots: demo/seed data only; Better-Half stays anonymised; kite-edge,
  desktasks, better-half, weekly-retro repos stay unlinked (private, user chose
  removal 2026-08-16); Hackmate gets no live link.
- New styles use existing CSS vars; light theme + palettes must keep passing AA.
- Stage by explicit path only; no `git add -A`.

## Decisions

**Made (do not re-litigate):**
- Lane: **1+2 hybrid** — restructure on v4's system, bold redesign confined to
  the homepage hero + Selected Work and the case-study anatomy (user, 2026-08-22).
- Signature-surface designs require user approval before implementation (WS-0.3).

**Made 2026-08-22 (round 2 of decisions — user chose one-shot execution):**
1. **Flagship trio: aarchid + experiment-hub + kite-edge.** KiteEdge photos/
   artifact are added LAST (user-dictated) — its dossier ships with the existing
   `analytics-api.png` and a reserved artifact slot until then.
2. **One-shot mode**: execute WS-0 → WS-A → WS-B → WS-C (treatment + available
   material only) → WS-D → WS-F → WS-E without per-workstream user checkpoints.
   WS-0's approval gate is waived by the user's one-shot instruction; the design
   rationale is documented in-repo instead.
3. **Globe (SignatureScene)**: unmounted from the new hero, component kept in
   tree, three.js deps NOT removed this round (standing "ask before deleting"
   rule from round 2 outranks the one-shot for irreversible-feeling deletions).
   Documented in DISABLED-INTERACTIVES.md. MusicToggle: untouched (already
   opt-in).
4. **Orphan pages**: lab + now get linked under a "More" nav group; /uses,
   /bookshelf, /changelog stay reachable from the footer only.

**Still needed from the user (non-blocking, land whenever):**
- WS-C source material: aarchid eval sheet, experiment-hub notebook, kite-edge
  QuantStats tear sheet + photos (explicitly deferred to last).

## WS-E — distribution checklist (user actions, off-repo)

The site side is done (JSON-LD Person, sitemap, RSS, dynamic OG images, live
links surfaced). What only the user can do:

1. **LinkedIn Featured**: add the three flagship case-study URLs
   (/projects/aarchid, /projects/experiment-hub, /projects/kite-edge) and the
   eval-harness blog post. This channel is the highest-claimed-ROI move in the
   research.
2. **Resume deep links**: the next resume PDF revision should link each listed
   project to its case-study URL, not just the homepage.
3. **Share-card check**: paste one flagship URL into LinkedIn's post composer
   and confirm the OG image reads well; if not, the /og route is the fix.
4. **Name SEO**: search "Dhruv Singhal" logged out once the deploy is live and
   confirm the portfolio ranks; the WebSite + Person JSON-LD already ship.
