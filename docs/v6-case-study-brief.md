# v6 case-study authoring brief

Applies to the five flagship product pages: aarchid, experiment-hub, kite-edge,
desktasks, tcs-nqt-prep-hub. Compact-tier projects keep their existing pages
untouched except for the mechanical MDX migration.

## Non-negotiables
- **Substance is never invented.** Every number, quote, claim and link must
  already exist in the current MDX, projects.json, README or a file Dhruv
  supplied. If a section calls for a number that does not exist, write "not
  measured yet" or omit the sentence. Never round up, never generalise
  ("hundreds of users") beyond the source.
- **Scope is exact.** Dhruv has ~1 year of product experience and is a PM
  intern. "Side project", "two-person build", "co-creator", "solo" are stated
  plainly in the masthead, spec table and first paragraph.
- **Voice.** First person, editorial, dry. Short paragraphs (≤4 sentences).
  No marketing adjectives (revolutionary, seamless, powerful). No em-dashes
  in new prose; use a full stop or a comma.
- **Product first, engineering second.** Architecture, code and stack detail
  live inside `<UnderTheHood>`; the main flow is readable by a non-engineer.

## Section order (h2 headings, exactly these titles)
1. **Who it's for, and why** — the user, their job to be done, why existing
   options fail. 2–3 paragraphs. Ends with the gap in one sentence.
2. **What I learned before building** — research method and the 2–3 insights
   that changed the plan. Use `<Quote>` if a real user/stakeholder quote exists.
3. **The bets, and what we cut** — the 3 constraints/principles that shaped
   scope, then `<Options>` listing alternatives with status chosen / rejected /
   deferred and a one-line why for each. This is where existing "Constraints",
   "Design Principles" and "Decisions & Trade-offs" text is re-homed.
4. **What we built** — the product as the user meets it, in the order the user
   meets it. `<Figure>` or `<Gallery>` with captions written as claims the
   image proves ("Diagnosis returns a health score, severity tier and cited
   plan"). `<Compare>` where a before/after exists. One `<Decision>` callout
   for the single most consequential call.
5. **How we knew it worked** — validation method (eval set, tests, pilot,
   usage), launch, and the honest limits of the evidence.
6. **Outcome** — bullet list of product outcomes first (accuracy, latency,
   cost, users, releases), then build facts. Frontmatter metrics gain
   `kind: product` or `kind: build`; only product metrics show in the strip.
7. **What I'd do next** — 3 bullets: next bet, open question, what I would do
   differently. Prospective, not apologetic.
8. `<UnderTheHood title="Architecture and implementation">` — everything
   technical from the old "Solution & Approach" and "Implementation" sections,
   with the code blocks and `<Artifact>` blocks. Nothing is deleted; it moves.
9. `<Artifacts>` row where artifacts exist (link only real files or URLs).

## Frontmatter additions
```yaml
metrics:
  - label: Diagnosis accuracy
    value: 92
    displayValue: "92%"
    kind: product
  - label: Test files
    value: 127
    displayValue: "127"
    kind: build
```
Keep every existing frontmatter field. Do not change slug, prevSlug, nextSlug.

## Component quick reference (props)
- `<Figure src alt caption size="wide|full|inline" />`
- `<Gallery><Shot src alt caption /></Gallery>`
- `<Compare before={{ src, label }} after={{ src, label }} caption />`
- `<Quote by="Name or role" role="context">text</Quote>`
- `<Options><Option name status="chosen|rejected|deferred" why="..." /></Options>`
- `<Timeline><Milestone date title>desc</Milestone></Timeline>`
- `<UnderTheHood title="...">markdown</UnderTheHood>`
- `<Decision>text</Decision>`
- `<Artifact title="...">code fence</Artifact>`
- `<Artifacts><ArtifactLink href type="sheet|notebook|pdf|doc|repo" title note /></Artifacts>`

MDX gotchas: escape bare `<` and `{` in prose (write "under 10 s" instead of
"<10s"); no HTML comments; use `className` not `class` if raw HTML is ever
needed (it should not be).

## Done check per page
- Reads top to bottom as a product page without opening Under the hood.
- Every image has a caption that states what it proves.
- Options table has at least one rejected alternative with a real reason.
- No number appears that is not in the old file or a supplied source.
- Word count within ±20% of the old file (this is a re-order, not a bloat).
