# Handoff to Codex: post-launch review, 3 October 2026

This handoff document is committed after `b6943e1`; it changes no code.

You are reviewing work that is already on `main` and in production. Your job is to find what is wrong, missing or overstated. Do not redo the work, and do not take any external action.

## 1. Ground rules

- **Read-only on the outside world.** Do not push, force-push, deploy, rewrite history, submit anything to Search Console, send the contact form, or send any outreach. If a fix is needed, write it on a branch or as a patch and stop for the owner.
- **Stage by explicit path.** Never `git add -A` or `git add .`; other sessions share this working tree.
- **Content rules (owner decisions; do not reverse):**
  - Aarchid is credited as co-built with Dilpreet Grover, and its offline-eval result figure stays withheld everywhere in site copy (tests in `tests/e2e/routes/shared.spec.ts` guard it).
  - The internship is dated Jul–Oct 2026: no "Currently" or "Present", and no schema `jobTitle`.
  - The excluded Sleep Company feature and internal tools never appear on the site or in the public repo. Their names are deliberately not written here.
  - The served resume `public/resume/dhruv-singhal-resume.pdf` is the owner's "0.7 Product" file, sha256 `2ed36bde71111d2d…`. It is an accepted exception, even though it says things the site does not. Do not flag it as a defect or regenerate it.
  - Do not add images, dates, metrics or outcomes the repo cannot prove.
- **Windows local hazards:**
  - Never request mixed-case slugs (for example `/projects/Aarchid`) against the local `next start`. On a case-insensitive filesystem that overwrites the page's prerender cache with a 404 until the next build.
  - If a local `/_next/image` URL hangs, restart the server. This is a `next start` optimizer quirk, not site code.

## 2. What to review

Range `c60846b..b6943e1` on `main`: 8 commits, 257 files, +11,944 / −5,043. In priority order:

| # | Commit | What it claims | Review it for |
|---|---|---|---|
| 1 | `5add5c5` fix(contact) | Resend v6 resolves `{ data, error }` and does not throw. The route returned 200 "Message received" even when Resend rejected the send, and returned 400 on a network throw. Both now return 502 with an honest message. | Is every failure path covered? Is the 429/503/400 ordering intact? Does the error log leak PII into Vercel logs? It logs only the Resend error object; confirm. Does `ContactForm` show the 502 text and move focus? |
| 2 | `3df577e` fix(404) | Every unknown URL is served the prerendered `/_not-found`, where the server's `usePathname()` is `"/_not-found"`. The pathname-length quote therefore mismatched in the browser and threw React #418. Now one fixed line, a server component. | Does any other component render inside `not-found` and read the URL? Check the layout, navbar, breadcrumbs and analytics. Is `tests/e2e/not-found-hydration.spec.ts`'s hydration wait (React fiber on the h1, plus 300 ms) reliable, or can it pass too early? |
| 3 | `818028d` test | Hidden-slug lists started empty on a clean checkout, so the guards failed in CI. They now start from `WITHDRAWN_ROUTES` and add the gitignored folders when present. The contact `beforeAll` hook has its own 60 s timeout. | Did any guard get weaker? In CI only `churn-analysis` is checked, so private drafts are tested only locally. Is that acceptable, or should a hashed list be committed? |
| 4 | `b6943e1` ci | `upload-artifact` ≥ 4.4 skips dot-directories, so `.next` was never uploaded and the Playwright and Lighthouse jobs had been failing at `download-artifact` without running. Added `include-hidden-files: true` and `if-no-files-found: error`. | Does the artifact restore to `.next/` and not `.next/.next/`? Look at the CI run for `b6943e1` (section 4). |
| 5 | `3a71d1c`, `e167e00` chore(repo) | `docs/audits/`, `docs/outreach/`, `content/resume/` and two working notes are now gitignored. Tracked copies were untracked (kept locally). History is **not** rewritten. | Run a fresh scan of `git ls-files` for internal or employer names, withheld figures and contact PII. Old content is still in git history. That is an owner decision (it needs a history rewrite and force-push); list it, do not do it. |
| 6 | `fb4f6ec` feat (243 files) | The whole PM-centric candidate: roster, claim gates, case-study masthead and evidence ledger, breadcrumbs, author bio, SEO fixes, per-route E2E. | Spot-check, don't line-read. Focus on `src/components/case-study/ProductMasthead.tsx`, `ProjectFacts.tsx`, `src/app/projects/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/lib/metadata.ts`, `content/projects.json` and `content/case-studies/*.mdx`. Check that claims match the evidence tier shown. |
| 7 | `38c8433` docs | `docs/owner-launch-verification.md`, the human-only checks. | Are the steps correct and complete? Does any step claim behaviour the site lacks? |

## 3. Evidence already gathered (verify, don't trust)

Every browser result is scripted Playwright or AI screenshot review. None of it is human testing.

| Check | Where | Result |
|---|---|---|
| 404 bug reproduced, red then green | `tmp/ux-fix-20261003/red/`, `before/`, `after/` (local only) | Red: 5 failed with #418, `/xy` the control passed. Green: 45/45 on five engines locally; 30/30 on five engines against production |
| Unit | `npx vitest run` | 12 files, 172 tests passed |
| Typecheck and lint | `npx tsc --noEmit`, `npm run lint` | 0 errors, 0 warnings |
| Clean-checkout CI equivalent (fresh worktree, `npm ci`, no gitignored folders) | `tmp/ux-fix-20261003/pw/clean-checkout-chromium-mobile.json` | chromium 648 passed, 5 skipped; mobile-chrome 550 passed, 103 skipped; 0 failed |
| Full chromium e2e + a11y, local build `9gpQowxjqmU0ZwZbiyXBT` | `tmp/ux-fix-20261003/pw/chromium-full.json` | 648 passed, 0 failed, 5 skipped |
| Route sweep, 36 routes × (390 dark, 1440 light) | `tmp/ux-fix-20261003/sweep.json` (local), `sweep-production.json` (production) | 72/72 both. 0 page errors, 0 hydration warnings, 0 failed local requests, 116 visible images all decoded, one h1 and one main everywhere, 0 overflow |
| Production deploy | Vercel status on `38c8433` and `5add5c5`: success | New case studies 200; `/projects/churn-analysis` and its OG image 404; sitemap 35 URLs, no churn; `robots.txt` has no `Host:` line; 404 has noindex and no canonical; resume hash unchanged; Aarchid shows no result figure and keeps the co-builder credit |
| Real mail | `POST https://dhruvsinghal.codes/api/contact` twice (08:52 and 08:56 UTC) | Both 200. Only the second (after `5add5c5`) proves Resend **accepted** the message. Inbox receipt is unconfirmed (owner) |
| Case-study first screen (390 × 844) | `tmp/ux-fix-20261003/case-study-first-screen.json` | Decision ends ≤ 531 px on all 10; Evidence label in the first screen on 9 of 10. No layout change was made; reasons in `docs/audits/2026-10-03-404-hydration-fix.md` §5 |

`tmp/` and `docs/audits/` are gitignored. They exist only in `D:\Dhruv-Personal\Wipro-old\Portfolio-v4`. Review there, not in a fresh clone, if you need them.

## 4. Open when this was written

- **CI on `b6943e1`: Success** (run 37111439850, 28 m 24 s). All four jobs passed: lint + unit, build, Playwright e2e + a11y (chromium + mobile-chrome, CI retries 2) and Lighthouse CI. It is the first run in which the Playwright and Lighthouse jobs actually executed. Linux CI also runs the two mixed-case probes that are skipped on Windows. Whether any test needed a CI retry was not checked (the run's report is uploaded only on failure).
- **www redirect:** `https://www.dhruvsinghal.codes/` answers **307**. Making it permanent (308) is a Vercel dashboard setting (Domains → www → Redirect → Permanent). Owner action.
- **Search Console:** not submitted. Owner steps are in `docs/owner-launch-verification.md` §1.
- **Human gates:** real phones, desktop Safari, keyboard-only, screen reader and inbox receipt are not done. Protocol and result tables are in `docs/owner-launch-verification.md`.
- **Content and owner gates** (from `docs/audits/2026-10-02-claim-gates.md`, local): Dilpreet Grover's confirmation before any Aarchid figure or the Forbes pitch; Weekly Retro link; external repo hygiene (claim-gates decision 4; details kept local); Cohort and Sawari screenshots; mobile lab LCP is 3.1–3.3 s against a 2 s target.
- **Untracked root notes** left alone: `handoff-claude-opus-portfolio-fix-batch.md`, `handover-cohort-studio-build.md`, `plan-github-readme.md`, `research-profile-readmes-2026-08.md`. They belong to other lanes; decide with the owner whether to ignore or delete them.

## 5. How to run things

```bash
npm ci
npx tsc --noEmit && npm run lint && npx vitest run
npm run build
# A local review server is already running on http://localhost:3100.
# It serves the build of 5add5c5 (BUILD_ID 9TAliztPAglCQDSAYNfTl; the CI-only
# commit b6943e1 changes nothing it serves).
# Restart: powershell -NoProfile -File tmp/pm-candidate-20261002/tools/server.ps1 stop|start|status
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test tests/e2e tests/accessibility --project=chromium --retries=0
node tmp/ux-fix-20261003/sweep.cjs   # 72-visit sweep; BASE=https://dhruvsinghal.codes OUT=... node tmp/ux-fix-20261003/sweep-env.cjs for production
```

Run long Playwright suites as background shell jobs, not inside a sub-agent (they stall on long silent runs).

## 6. What to send back

Write findings to `docs/reviews/2026-10-0X-codex-review.md`. For each finding give: severity (P0–P3), `file:line`, a concrete failure scenario, and the evidence (the command and its output). Separate "verified defect" from "risk" and from "taste". Say explicitly which rows of section 3 you re-ran and which you took on trust. Do not commit or push the review; leave it for the owner.
