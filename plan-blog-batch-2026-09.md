# Plan: blog batch, September 2026

Date: 2026-09-03. Planned by Fable 5.1; written by six parallel Opus 5 agents; verified and committed by one. Branch: `fix/site-polish-2026-09` (continues the polish branch).

## Baseline
Eight posts (2026-02-28 to 2026-08-16), 644–1,122 words, categories Product ×6, Career ×1, AI ×1, Data ×0. /ai-pm lists posts whose tags match `/ai|llm|ml|pm/i` (only the eval-harness post today). Home "How I think" is hardcoded to two slugs (src/app/page.tsx:25-28) and stays as is. RelatedArticles scores shared tags + same category. `src/app/ai-pm/page.tsx:193-206` promises an essay series "The PRD is dead, long live the eval set".

## Rules for every post
- Author is a PM intern with about one year of PM experience (Omniful BA internship Jun–Aug 2024; Wipro AI Product Intern Feb–Jul 2026; The Sleep Company PM Intern, Growth, Jul 2026–). Never claim or imply 3+ years. Fix the existing "Over three years" line in content/blog/structured-thinking-framework.mdx.
- Nothing confidential from any employer: no company names for current-employer work, no internal numbers, prices, roadmaps, or product names. Public facts from the resume and case studies are fine.
- No links to private repos (kite-edge, desktasks, better-half, weekly-retro).
- 800–1,100 words, British-leaning spelling as in existing posts ("artefact"), first person, short declarative sentences mixed with longer ones, one concrete example with real numbers, H2 headings, closing imperative plus one internal link (a related post or case study). Frontmatter exactly as the existing schema: slug, title, date, updatedDate: null, category (Product|Data|Career|AI), tags, readingTime ("N min read", N = ceil(words/200)), excerpt (≤160 chars, no markdown), socialImage: null.

## Posts

| # | Slug | Category | Date | Grounding | Why |
|---|---|---|---|---|---|
| B1 | the-prd-is-dead-long-live-the-eval-set | AI | 2026-09-03 | Aarchid case study (60-photo eval set, 4-dimension rubric, 92 % accuracy, $0.25/user/mo); existing eval-harness post | Delivers the promised series opener; second post for /ai-pm |
| B2 | choosing-a-product-without-ai | AI | 2026-09-02 | research-pm-one-shot-products-2026-09.md (ranked shortlist, no-AI re-evaluation, Cohort & Retention Studio chosen) | Prioritisation judgment, contrarian AI take, tags qualify for /ai-pm |
| B3 | figma-to-live-parity-audit | Product | 2026-09-01 | Anonymised design-parity tracker (~45 items, 8 screens, columns ID/Screen/Action/Where/Differs from design/Priority/Source/Owner/Status, P1–P3, two sources: design team vs. code check) | PM craft: turning "it looks off" into a ranked, ownable tracker |
| B4 | cohorts-before-dashboards | Data | 2026-08-31 | D:\Dhruv-Personal\Side-Projects\cohort-retention-studio (README/spec, read-only); existing data-driven and metrics posts | First Data post; ties to the current build |
| B5 | one-year-of-pm-internships | Career | 2026-08-30 | Resume + About page facts only (Omniful leads 10→200+/day and 10 B2B acquisitions; Hackmate 300+ users; Aarchid) | Honest APM-level career post; complements why-pms-should-code |
| B6 | seventeen-checks-before-you-call-a-site-done | Product | 2026-08-29 | plan-portfolio-polish.md (audit vs checklist, 590 Playwright tests, images 4.1→1.4 MB, favicon, tap bug) | Builder credibility; QA as product work |

## Verification (one agent, after writers)
- Frontmatter parses; category in enum; readingTime matches word count; excerpt ≤160; slugs unique and match filenames.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`; route table shows 14 blog slugs; `npx playwright test --project=chromium tests/e2e/seo.spec.ts tests/e2e/links.spec.ts` on port 3100.
- /ai-pm renders B1 and B2; /blog search finds each; RelatedArticles non-empty on each new post.
- Commit by explicit path: `content(blog): six new posts, experience-claim fix` then update this file's status.

## Status
Done. Verified and committed 2026-09-03 on `fix/site-polish-2026-09`.

- Six posts shipped, 959-1,088 body words (B1 1,048 / B2 1,082 / B3 1,088 / B4 1,052 / B5 959 / B6 1,001); all frontmatter valid against the schema.
- Fixed: readingTime 5 -> 6 min on choosing-a-product-without-ai and seventeen-checks-before-you-call-a-site-done; experience claims rewritten in structured-thinking-framework.mdx (2 lines) and why-pms-should-code.mdx (1 line).
- No claim of 3+ years or people management remains anywhere in content/blog or content/case-studies; the "Senior PM" line in why-pms-should-code.mdx is advice by career stage, not a self-claim, and stays.
- Quality pass clean: all 11 internal links resolve, at most 2 em-dashes per post, no employer-confidential specifics in the parity-audit post, every post has H2s and a closing internal link.
- `npm run lint` and `npx tsc --noEmit` clean; `npm run build` compiled with no errors or warnings and 14 blog slugs in the route table.
- Playwright chromium on port 3100: seo 49 passed, links + navigation 16 passed, 0 failed. /ai-pm links B1 and B2, all six /blog pages return 200 with correct titles, /blog/cohorts-before-dashboards shows the Data label, and the /ai-pm bench entry now links the published opener.
