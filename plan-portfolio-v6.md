# Portfolio v6 — case studies as standalone product pages

Status: APPROVED 2026-09-02, executing on branch v6-case-studies.
Decisions: (1) roster = five deep product pages + compact index for the rest;
(2) migrate case studies to real MDX components; (3) Dhruv supplies inputs per
docs/v6-inputs-checklist.md; (4) home Selected Work becomes a product carousel.
Predecessor: plan-portfolio-v5.md (all workstreams shipped except WS-C artifacts).

## 0. What the inspection found

Method: four parallel audits (case-study content, rendering/design layer, live
screenshots at 1440 and 390 wide in both themes, prior research + plans) plus a
manual read of the Aarchid, Churn, Projects and ExperimentHub pages.

### What already works — keep it
- The shell is a distinctive editorial system, not a template: Fraunces display,
  Manrope body, JetBrains Mono eyebrows, working-paper light / Prussian-ink dark,
  numbered contents rail on home. Zero console errors, zero broken images,
  Lighthouse 95+. Do not touch fonts or palette.
- Every case study follows one skeleton (Context → Research → Constraints →
  Solution → Decisions → Outcome → Learnings) with a spec table (Role / My part /
  Timeline / Team / Outcome / Live / Stack), TL;DR and a metric strip.
- Aarchid, ExperimentHub and KiteEdge are genuinely strong on rigour: constraints
  stated up front, decisions with rationale, honest deferred scope.

### Why it still does not read as "standalone products" to a PM reviewer
1. **Engineering dossier voice, not product story.** Solution sections are
   architecture-first ("Deterministic assignment in Rust", "the Edge Stack").
   The reviewer for a PM role wants: who the user is, the insight, the bets and
   what was cut, how it was validated, what happened after launch. That
   material exists in fragments but is buried under stack detail.
2. **Metrics are build facts, not product outcomes.** 50+ endpoints, 127 test
   files, 1,940 tests, 575 RLS checks, 8 workers. Only Aarchid (92% on a 200
   sample golden set, P95 < 10s, $0.25/user) reads as a product outcome. The
   prior research (research-pm-portfolios-2026-08.html) flagged exactly this:
   causal impact, never activity counts.
3. **No product identity per page.** No wordmark, no product accent colour, no
   one-line "what it is / who it is for", no status (live / private beta /
   archived), no business-model chip, no "Try it" module. The page title is the
   only thing that says "this is a product".
4. **Imagery is the visual weak point.** Case-study heroes are bare screenshots
   cropped on the left by `object-fit: cover` (Aarchid headline reads
   "r plants / erve a / tal twin", KiteEdge "e Analytics Engine") —
   src/components/case-study/CaseStudyHero.module.css:50-54. Churn Analysis and
   Hackmate have zero images; 5 of 9 studies have no gallery. Screenshots are
   pale UI on cream, so they carry little weight; in dark mode they become
   bright rectangles. No device or browser framing, no video/GIF of the core
   loop, no before/after.
5. **Only three body block types exist.** The "MDX" is regex-converted markdown
   (src/lib/markdown.ts) with raw-HTML class grammar: `.case-gallery`,
   `.case-artifact`, `.case-decision` (used once, in Aarchid). No figure with
   caption, no pull-quote, no user quote, no alternatives-considered table, no
   timeline, no two-up comparison. So every study is a 720px text column of
   h2 / h3 / bullets / code for 5–9k px.
6. **No wayfinding inside a study.** Pages are 5–9k px tall (Aarchid mobile
   10.6k) with no sticky chapter rail, although the home page already has the
   pattern.
7. **Roster is too wide for the depth available.** 12 projects, 9 full case
   studies. Weakest three (Churn 492 words with a hedged "~15% potential";
   Hackmate 630 words, no images, unclear co-builder split; Better-Half with
   only infra metrics) dilute the strongest three.
8. **Small defects.** KiteEdge ships an HTML TODO comment
   (content/case-studies/kite-edge.mdx:123). Home repeats the same three
   projects in Selected work, Also built and Where to go next. Related work is
   a plain list, no thumbnails.

## 1. Target state

Audience framing (corrected 2026-09-02): Dhruv has about one year of product
experience and is currently a PM intern (Growth) at The Sleep Company, applying
for APM / early PM roles. The portfolio should therefore win on **depth,
honesty of scope and quality of decision-making on a few real products**, not
on breadth or scale claims. Every status pill, team line and "my part" row must
be exact; "side project", "two-person build" and "internship" are strengths
when the decision trail is good, and liabilities only when blurred.

Each flagship case study should be readable as a **product page that happens
to carry the PM decision trail**, i.e. a visitor who never reads a paragraph
still learns: what it is, who it is for, what it looks like, whether it is
live, what it achieved. A visitor who does read gets the decision trail in the
order a PM interview would probe it.

Proposed page anatomy (top to bottom):

1. **Product masthead** — wordmark or product name in its own accent, one-line
   tagline, audience line, status pill (Live / Private beta / Archived /
   Internal), business-model chip, "Try it" + "Source" buttons.
2. **Framed hero** — screenshot inside a browser/device frame on a tinted
   ground of the product's own accent; never cropped; optional 20–40s
   muted loop (webm) of the core action where one exists.
3. **Spec table** (as today) + **TL;DR** (as today).
4. **Outcome strip, product-first** — 3–4 product outcomes (users, accuracy,
   latency, cost, retention). Build facts move to an "Under the hood"
   disclosure later on the page.
5. **Sticky chapter rail** (desktop) with the section list.
6. **Body in PM order**: Who & why → Insight from research → Bets & what we cut
   (alternatives table) → What we built (figures with captions, two-ups) →
   Validation & launch → Outcome → What I'd do next. Architecture and code
   collapse into "Under the hood".
7. **Artifacts row** — eval sheet, notebook, PRD excerpt, decision log as
   downloadable/linked items (WS-C from v5, still user-supplied).
8. **Related products** as image cards, then prev/next.

New authorable MDX components (decision 2: real MDX via next-mdx-remote/rsc or
@mdx-js/mdx, replacing the regex converter for case studies):

| component | purpose |
|---|---|
| `<Figure>` | full-width image or muted video + caption, lightbox |
| `<Gallery>` + `<Shot>` | grid of framed screenshots with captions (replaces .case-gallery) |
| `<Compare>` | two-up before/after or option A/B |
| `<Quote>` | user / stakeholder quote with attribution |
| `<Options>` + `<Option>` | alternatives considered: option / chosen or rejected / why |
| `<Timeline>` + `<Milestone>` | discovery → build → launch milestones |
| `<UnderTheHood>` | collapsible technical section (details/summary) |
| `<Decision>` | decision callout (replaces .case-decision) |
| `<Artifact>` | code/terminal artifact with title (replaces .case-artifact) |
| `<Artifacts>` + `<ArtifactLink>` | artifact row with type chips |

Data model additions in content/projects.json per project: `productName`,
`tagline`, `audience`, `status`, `businessModel`, `accent` (hex),
`wordmark` (path or null), `demoVideo` (path or null).

## 2. Workstreams

**WS-0 Quick fixes (same day).** Hero crop → `object-fit: contain` on a paper
matte or a per-project `object-position`; remove the KiteEdge TODO; dark-mode
screenshot matte (frame + slight dim); dedupe the repeated project lists on
home.

**WS-1 Rendering: product masthead, framed hero, chapter rail, block grammar.**
Files: src/components/case-study/CaseStudyHero.tsx + .module.css,
src/app/projects/[slug]/page.tsx, src/components/case-study/MdxContent.module.css,
src/lib/markdown.ts (only if a block needs preprocessing), content/projects.json
schema + src/types. Verify with the existing vitest + Playwright/axe suite.

**WS-2 Content rewrite, flagship three.** Aarchid, ExperimentHub, KiteEdge
restructured into the PM order above; architecture moved under the hood;
alternatives tables written from the decisions already in the text; product
outcome strip re-cut. Rule carried from v5: substance is never invented —
numbers, testimonials and claims stay exactly as sourced; presentation only.

**WS-3 Roster decision and weak-three treatment.** Recommended: five full
product pages (Aarchid, ExperimentHub, KiteEdge, DeskTasks, TCS NQT Prep Hub)
and a compact "Also built" index entry (headline, role, 2–3 sentences, one
outcome, link) for Hackmate, Better-Half, Churn Analysis, Portfolio site and
the remaining roster. Churn is reframed as a decision story or demoted;
Hackmate is either evidenced (growth trajectory, co-builder split, screens) or
compacted; Better-Half is repositioned as a privacy-design decision study.

**WS-4 Inputs from Dhruv ("better inputs").** Per flagship product:
- 4–6 screenshots at 2x on seed/demo data, including one mobile frame.
- One 20–40s screen recording of the core loop (webm or mp4, muted).
- Real usage numbers that exist (waitlist/signups, WAU, retention, downloads,
  release count) — with the source, or an explicit "not measured".
- One user or stakeholder quote each, attributable or anonymised.
- Product wordmark/logo (SVG or PNG) and the product's own accent colour.
- The v5 WS-C artifacts: Aarchid eval sheet, ExperimentHub notebook, KiteEdge
  QuantStats tearsheet + product photos.
- For each: "what did we decide not to build, and why" in two lines.

**WS-5 Listing + home.** Home Selected Work: replace the three full-width
dossier rows with a horizontal scroll-snap carousel of the five flagship product
cards (framed shot, product name, tagline, status pill, one outcome, Case study
+ Live links). Next card peeks so nothing is hidden; prev/next buttons, dots,
keyboard arrows, touch swipe, respects prefers-reduced-motion, no autoplay.
Goal: more of the work visible sooner on the landing page. /projects: featured
section becomes five product cards; the rest become compact rows (no image);
related work becomes image cards.

**WS-6 Verify.** Lighthouse + axe unchanged (95+/100), Playwright screenshots
of all flagship pages in both themes at 1440 and 390, manual read for voice.

## 3. Decisions needed before execution
1. Roster: five deep product pages + compact index for the rest (recommended),
   or keep all nine as full case studies?
2. Rendering approach: extend the HTML-class grammar (fast, zero regression
   risk, recommended for v6) or migrate to real MDX components (@next/mdx is
   already a dependency; cleaner long-term, higher risk)?
3. Do product brand assets exist (wordmarks, colours) for Aarchid, KiteEdge,
   ExperimentHub, DeskTasks, TCS NQT? Can you record short demo loops?
4. Which usage numbers actually exist and can be shown? Nothing will be
   invented; where a number is absent the page will say "not measured" or
   drop the claim.

## 4. Order of execution once approved
WS-0 → WS-1 → WS-2 (Aarchid first as the reference page, then the other two)
→ WS-5 → WS-3 → WS-6. WS-4 runs in parallel and gates the final pass, as WS-C
did in v5.
