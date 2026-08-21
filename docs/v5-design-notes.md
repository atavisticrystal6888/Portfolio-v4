# v5 design notes — the two signature surfaces

WS-0 record. The user waived the approval gate (one-shot instruction), so this
file is the design rationale that would have been the proposal. Before-state
screenshots were skipped for the same reason; the "before" is described inline
and verification screenshots happen in the end-of-release QA pass.

## Direction

Both surfaces push the existing "working paper" identity to its logical end:
the homepage becomes the paper's **title block + contents**, and each case
study becomes a **filed dossier** with visible decision structure. No new
palette, no new fonts — Fraunces/Manrope/JetBrains Mono and the signal-blue
token system carry everything. One new type token (`--text-hero`) for the
title-block headline.

## Surface 1 — homepage hero + Selected Work

Before: centred name + role chip + statement + two buttons over a Three.js
globe; no project work anywhere on the home page (projects lived only behind
the nav). Metrics, career timeline, testimonials, blog followed.

After — "the title block of a working paper":

- The hero flips name/thesis hierarchy. The display headline is the thesis
  ("I scope, spec, and ship the v1 myself." — the user's own working method,
  per the About-story thesis in handover-portfolio-round2.md), set in Fraunces
  at a new `--text-hero` size. The name moves to a mono author line beneath,
  with the real current role as the status line. Research basis: hero = who +
  what I ship + status; voice is the top observed differentiator.
- Right column (≥1000px): a mono **Contents** index with dotted leaders —
  01 Selected work / 02 Measured outcomes / 03 How I think / 04 References /
  05 Contact — each an in-page anchor. A paper's table of contents, doing real
  navigation. Hidden on mobile (nav covers it).
- The globe (SignatureScene hero variant) is unmounted, not deleted: the
  research warns that decoration without a decision trail reads as style over
  substance, and the working-paper ground wants flatness. Dossier/lab variants
  stay. Deps stay until the user rules on them (round-2 "ask before deleting").
- **Selected Work** is the new first section — the research's core fix: work
  before biography, curation as the architecture. Three flagship rows
  (aarchid, experiment-hub, kite-edge; `tier: "flagship"` in projects.json),
  each composed as a dossier opening: serif title, mono "my part" line,
  outcome-led description, metric numeral over the blue baseline rule,
  screenshot with hairline frame, "Case study →" + "Live app ↗" actions.
  The screenshot crosses the row's top rule (small negative offset) so each
  flagship reads as an attachment clipped to the paper — the one deliberate
  aesthetic risk on this surface.
- Remaining featured projects compress to an "Also built" list row group
  with an "All projects →" link. Career timeline leaves the home page
  (/about already tells that story); blog teaser becomes "How I think" and
  pins the two most PM-signal posts (eval harness, why-PMs-should-code).

## Surface 2 — case-study (dossier) anatomy

Before: dossier header (title/subtitle/spec table/screenshot) → TL;DR →
metric tiles → linear MDX body → related work → prev/next.

After — the six-part skeleton made visible:

- Spec table gains two rows: **My part** (new `myPart` frontmatter — exact
  ownership, the anti-"contributed to" move) and **Live** (the deployed URL,
  passed from projects.json; research: live demos are becoming table stakes).
- Body grammar gains two devices, both plain HTML conventions the custom
  markdown pipeline already passes through:
  - `<div class="case-decision">` — decision note with a mono DECISION label:
    the trade-off trail hiring managers actually evaluate, visually distinct
    from narrative prose. Replaces the anonymous blockquote treatment for
    "Key decision" asides.
  - `<figure class="case-artifact">` — the human-artifact treatment: hairline
    frame, mono ARTIFACT label, annotated caption in the author's voice.
    Ships now so KiteEdge/Aarchid artifacts drop in when the user supplies
    them; renders nothing until then (no fabricated artifacts).
- Content pass (facts only, presentation only): flagships get explicit
  Constraints and Decisions sections reorganised from material already in the
  body; every case study gets `myPart`; causal phrasing for metrics where the
  causality is already stated in the body.

## What deliberately did not change

TL;DR-then-metrics stays (abstract + key figures, the working-paper order).
MetricChart, RelatedWork, CaseStudyNav, Suggestions, contact CTA, footer:
untouched. Both themes inherit everything through existing tokens; no colour
is defined outside tokens.css.
