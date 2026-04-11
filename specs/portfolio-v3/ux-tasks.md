# Tasks: Portfolio v3 — UX Improvement Phases

**Input**: Design documents from `specs/portfolio-v3/phases.md`
**Prerequisites**: phases.md ✅, plan.md ✅, spec.md ✅, tasks.md ✅ (T001–T178 existing)

**Continuation**: Task IDs continue from T179 (portfolio-v3 main tasks.md ends at T178).

**Organization**: Tasks grouped by UX improvement phase (Phase 0–6 from phases.md), mapped to new user stories US14–US19. Phase 0 has no story label (quick wins / foundational). Phases 1–6 map to US14–US19 respectively.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US14–US19)
- All paths relative to `portfolio-next/` project root

---

## Phase 0: Quick Wins (No Story Label)

**Purpose**: Close visible gaps with minimal complexity. No dependencies on any other UX phase.

### 0.1 — Finish `/now` Page

- [x] T179 Update Now page content in `portfolio-next/src/app/now/page.tsx` — add `lastUpdated` date display using `formatDate()`, intro paragraph explaining the /now page concept, update hardcoded "March 2026" dates to current month, add structured section headings with `SectionLabel` component
- [x] T180 [P] Polish Now page styles in `portfolio-next/src/app/now/now.module.css` — timeline-style section layout with left accent borders using `--accent-primary`, consistent spacing with design tokens, responsive single-column on mobile, proper print styles

### 0.2 — Draft Mode for Content

- [x] T181 Add `draft?: boolean` field to `CaseStudy` type in `portfolio-next/src/types/project.ts` and `BlogArticle` type in `portfolio-next/src/types/blog.ts`
- [x] T182 Update content loading functions in `portfolio-next/src/lib/content.ts` — `getAllBlogPosts()` and `getAllCaseStudies()` filter out items where `frontmatter.draft === true` when `process.env.NODE_ENV !== 'development'`; add `getAllBlogPostsIncludingDrafts()` for dev tooling
- [x] T183 [P] Update sitemap generation in `portfolio-next/src/app/sitemap.ts` — exclude draft blog posts and draft case studies from sitemap XML output using same draft-filtering logic

### 0.3 — Content Scaffolding Script

- [x] T184 Create content scaffolding script in `portfolio-next/scripts/new-content.ts` — accepts `--type blog|case-study`, `--slug`, `--title` CLI args; generates MDX file with frontmatter template (date, category, tags, readingTime for blog; slug, title, role, duration, stack, metrics, prevSlug, nextSlug for case study); if case study, appends entry to `content/projects.json`; validates slug uniqueness against existing files

### 0.4 — RSS Feed

- [x] T185 Create RSS feed route handler in `portfolio-next/src/app/feed.xml/route.ts` — generates RSS 2.0 XML from `getAllBlogPosts()`, includes title, description, link, pubDate, guid for each post; sets `Content-Type: application/rss+xml` header; uses `NEXT_PUBLIC_SITE_URL` env var for absolute URLs
- [x] T186 [P] Add RSS autodiscovery link to root layout in `portfolio-next/src/app/layout.tsx` — add `<link rel="alternate" type="application/rss+xml" title="Dhruv Singhal Blog" href="/feed.xml">` in metadata

**Checkpoint**: `/now` page polished with current dates and timeline layout. Adding `draft: true` to any MDX frontmatter hides it from prod listing and sitemap. `npx tsx scripts/new-content.ts --type blog --slug test --title "Test"` creates a valid MDX file. `/feed.xml` returns valid RSS 2.0 XML.

---

## Phase 1: US14 — Visitor Engagement

**Purpose**: Make the site stickier and more interactive for recruiters and collaborators. No dependencies on other UX phases.

### 1.1 — Reading Progress Persistence

- [x] T187 [US14] Add localStorage persistence to ReadingProgress component in `portfolio-next/src/components/blog/ReadingProgress.tsx` — debounced save of `{ slug, progress, timestamp }` to localStorage key `ds-reading-progress` on scroll; only persist when progress > 5%; prune entries older than 30 days
- [x] T188 [US14] Add resume-reading toast to blog article page in `portfolio-next/src/app/blog/[slug]/page.tsx` — on mount, check localStorage for saved progress > 10% for current slug; if found, show toast via `DSToast` with "Resume where you left off?" message and action button that scrolls to saved percentage position; dismiss clears saved entry

### 1.2 — Enhanced Command Palette

- [x] T189 [US14] Enhance CommandPalette with grouped results and actions in `portfolio-next/src/components/interactive/CommandPalette.tsx` — group results by category (Pages, Case Studies, Blog Articles, Actions); add action items: "Download Resume" (navigates to `/resume/`), "Copy Page URL" (copies `window.location.href` to clipboard + toast confirmation); add keyboard shortcut hints next to action labels
- [x] T190 [US14] [P] Add recency-based ranking to CommandPalette in `portfolio-next/src/components/interactive/CommandPalette.tsx` — import `useBehavior` hook; boost search result scores for recently visited pages (last 5 pages get +0.3 score multiplier, decaying by position)

### 1.3 — Micro-Interaction Feedback on CTAs

- [x] T191 [US14] Add Framer Motion hover/tap animations to Button component in `portfolio-next/src/components/ui/Button.tsx` — wrap button with `motion.button`; `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}` on primary/secondary variants; add `data-magnetic` attribute to primary buttons; respect `useReducedMotion` (skip scale when true)
- [x] T192 [US14] [P] Add ripple effect CSS to Button styles in `portfolio-next/src/components/ui/Button.module.css` — `@keyframes ripple` animation on `::after` pseudo-element triggered by `:active` state; accent-colored radial gradient expanding from click point; `prefers-reduced-motion: reduce` disables ripple
- [x] T193 [US14] Add magnetic cursor attraction for `data-magnetic` elements in `portfolio-next/src/components/interactive/CustomCursor.tsx` — on mousemove near elements with `data-magnetic` attribute, apply transform offset pulling cursor ring toward element center (max 10px attraction radius); release on mouseleave

### 1.4 — Project Comparison View

- [x] T194 [US14] Create ComparisonTable component in `portfolio-next/src/components/projects/ComparisonTable.tsx` + `ComparisonTable.module.css` — responsive table rendering all projects with columns: Project Name (links to case study), Role, Stack (Badge chips), Key Metric (`MetricCounter`), Duration; mobile: horizontally scrollable with sticky first column; uses `GlassCard` wrapper
- [x] T195 [US14] Add grid/table view toggle to Projects page in `portfolio-next/src/app/projects/page.tsx` — add `viewMode` state (`'grid' | 'table'`); toggle button with grid and table icons; conditionally render `ProjectGrid` or `ComparisonTable`; persist preference in localStorage key `ds-projects-view`

**Checkpoint**: Blog articles offer "Resume reading" toast on revisit. Ctrl+K shows grouped + ranked results with actions. Primary buttons have magnetic cursor pull and ripple on click. Projects page toggles between grid and table views.

---

## Phase 2: US15 — Credibility & Depth

**Purpose**: Make case studies the portfolio's strongest differentiator. Depends on T181 (draft types) for content schema conventions.

### 2.1 — Interactive Metric Drill-Downs

- [x] T196 [US15] Create MetricDetail expandable panel component in `portfolio-next/src/components/ui/MetricDetail.tsx` + `MetricDetail.module.css` — props: `{ value, label, methodology?, baseline?, timeframe? }`; click to expand detail panel with Framer Motion `AnimatePresence` (slide-down + fade); collapsed state shows value + label only; expanded shows methodology paragraph, baseline before/after, timeframe; `aria-expanded` toggle; reduced-motion: instant show/hide
- [x] T197 [US15] [P] Add `methodology`, `baseline`, and `timeframe` fields to metrics array in case study frontmatter — update all 4 MDX files: `portfolio-next/content/case-studies/aarkid.mdx`, `churn-analysis.mdx`, `marketing-effectiveness.mdx`, `portfolio-site.mdx` with contextual methodology descriptions, baseline values, and measurement timeframes for each metric
- [x] T198 [US15] [P] Update CaseStudy type in `portfolio-next/src/types/project.ts` — add optional `methodology?: string`, `baseline?: string`, `timeframe?: string` fields to the metrics array item type
- [x] T199 [US15] Integrate MetricDetail into case study page template in `portfolio-next/src/app/projects/[slug]/page.tsx` — replace static metric displays with `MetricDetail` components; pass methodology/baseline/timeframe from frontmatter data

### 2.2 — PDF Export for Case Studies

- [x] T200 [US15] Create PrintButton component in `portfolio-next/src/components/ui/PrintButton.tsx` + `PrintButton.module.css` — button that calls `window.print()`; styled as ghost/secondary variant; hidden via `@media print { display: none }`; icon: printer/download icon from Lucide
- [x] T201 [US15] [P] Add case-study-specific print rules to `portfolio-next/src/styles/print.css` — branded header block with "Dhruv Singhal — dhruvsinghal.com" and page title; metric cards in 2-column grid layout; code blocks with light borders; ensure page breaks avoid splitting metric panels or code blocks; hide interactive elements (MetricDetail toggle, navigation buttons)
- [x] T202 [US15] Add PrintButton to case study page header in `portfolio-next/src/app/projects/[slug]/page.tsx` — position next to page title or in header action area; label: "Download as PDF"

### 2.3 — Video/Demo Embeds on Case Studies

- [x] T203 [US15] Add `demoUrl?: string` and `videoUrl?: string` fields to CaseStudy type in `portfolio-next/src/types/project.ts`
- [x] T204 [US15] [P] Create DemoEmbed component in `portfolio-next/src/components/ui/DemoEmbed.tsx` + `DemoEmbed.module.css` — responsive iframe wrapper (16:9 aspect ratio); `loading="lazy"` attribute; fallback thumbnail/placeholder before load; supports YouTube, Vimeo, and generic URLs; sanitize URLs (allowlist domains); accessible: `title` attribute on iframe
- [x] T205 [US15] Conditionally render DemoEmbed in case study page template in `portfolio-next/src/app/projects/[slug]/page.tsx` — if `videoUrl` or `demoUrl` exists in frontmatter, render `DemoEmbed` between hero section and content; if neither exists, render nothing (no empty space)

**Checkpoint**: Clicking any case study metric expands a detail panel with methodology and baseline. "Download as PDF" produces a clean branded print layout. Case studies with video URLs show embedded players.

---

## Phase 3: US16 — Owner Intelligence

**Purpose**: Give the portfolio owner visibility into how visitors interact with the site. Depends on existing Vercel Analytics (`@vercel/analytics`).

### 3.1 — Scroll Depth Tracking

- [x] T206 [US16] Create `useScrollDepth` hook in `portfolio-next/src/hooks/useScrollDepth.ts` — place 4 invisible sentinel `<div>` elements at 25%, 50%, 75%, 100% scroll positions via IntersectionObserver; fire `window.va?.track('scroll_depth', { page: pathname, depth: threshold })` once per threshold per page load; dedup via sessionStorage key; cleanup observer on unmount
- [x] T207 [US16] [P] Mount scroll depth tracking on content-heavy pages — add `useScrollDepth` hook invocation in `portfolio-next/src/app/projects/[slug]/page.tsx` (case studies) and `portfolio-next/src/app/blog/[slug]/page.tsx` (blog articles); pass current pathname as page identifier

### 3.2 — Contact Attribution

- [x] T208 [US16] Add referring page tracking to contact page in `portfolio-next/src/app/contact/page.tsx` — read last entry from `useBehavior().pagesVisited` array; store as hidden form field `referringPage` in ContactForm; fallback to `document.referrer` if behavior data empty
- [x] T209 [US16] [P] Accept `referringPage` field in contact API route in `portfolio-next/src/app/api/contact/route.ts` — add optional `referringPage` string to request validation; include in console log output and in future Resend email body; sanitize value (strip query params, validate is internal path)

### 3.3 — Resume Download Tracking

- [x] T210 [US16] Create TrackedLink component in `portfolio-next/src/components/ui/TrackedLink.tsx` — wrapper around `<a>` that fires `window.va?.track(eventName, eventData)` on click before navigation; props: `{ href, eventName, eventData?, children, ...anchorProps }`; for external/download links, use `navigator.sendBeacon` pattern to ensure event fires before navigation
- [x] T211 [US16] [P] Replace plain resume links with TrackedLink in `portfolio-next/src/components/layout/Navbar.tsx` and `portfolio-next/src/app/about/page.tsx` — use `eventName="resume_download"` and `eventData={{ source: 'navbar' | 'about' }}`

### 3.4 — OG Image Generation

- [x] T212 [US16] Create dynamic OG image route in `portfolio-next/src/app/og/route.tsx` — accepts query params `title`, `metric`, `type` (page|case-study|blog); returns 1200×630 PNG via `ImageResponse` from `next/og`; branded layout: dark background (`#0a0a0b`), gradient accent bar, Satoshi font, page title in large text, metric value if provided, "dhruvsinghal.com" footer; validate and sanitize all query params
- [x] T213 [US16] [P] Update metadata utility in `portfolio-next/src/lib/metadata.ts` — modify `generatePageMetadata()` to set `og:image` URL dynamically pointing to `/og?title=...&metric=...&type=...` for each page; encode params safely; add Twitter card `twitter:image` with same URL

**Checkpoint**: Vercel Analytics shows `scroll_depth` events with page + depth. Contact form submissions include `referringPage` field. Resume downloads tracked as `resume_download` events. Sharing any page on social media shows branded OG card with title and metric.

---

## Phase 4: US17 — Quality Gates & CI

**Purpose**: Automate quality enforcement. No dependencies on other UX phases. Fully parallelizable.

### 4.1 — Lighthouse CI GitHub Action

- [x] T214 [US17] Create Lighthouse CI configuration in `portfolio-next/lighthouserc.json` — define 6 URLs to test (`/`, `/about`, `/projects`, `/blog`, `/contact`, `/now`); assert all 4 categories (Performance, Accessibility, Best Practices, SEO) ≥ 90; configure `numberOfRuns: 3` for stability; output format: JSON + HTML reports
- [x] T215 [US17] [P] Create GitHub Actions workflow in `.github/workflows/lighthouse.yml` — trigger on push to `main` and pull requests; build portfolio-next (`npm run build`); start local server (`npm start`); run `treosh/lighthouse-ci-action@v11` against lighthouserc.json URLs; upload report artifacts; fail workflow if any assertion fails

### 4.2 — Broken Link Checker

- [x] T216 [US17] Create link checker script in `portfolio-next/scripts/check-links.ts` — build site (`next build`), start local server on random port, crawl all discovered routes starting from `/`; extract all `<a href>` and `<link href>` from each page; validate internal links resolve (HTTP 200); validate external links respond (HTTP 2xx/3xx, timeout 10s); report summary: pages crawled, links checked, broken links list; exit code 1 if any broken links
- [x] T217 [US17] [P] Add `check-links` script to `portfolio-next/package.json` — `"check-links": "npx tsx scripts/check-links.ts"`

### 4.3 — Visual Regression Tests

- [x] T218 [US17] Create Playwright visual regression test in `portfolio-next/tests/e2e/visual-regression.spec.ts` — test 6 key routes (`/`, `/about`, `/projects`, `/blog`, `/contact`, `/now`) × 2 themes (dark, light) × 2 viewports (375px mobile, 1280px desktop) = 24 screenshots; set `data-theme` attribute before screenshot; compare against baseline with `maxDiffPixelRatio: 0.01`; generate diff images on failure
- [x] T219 [US17] [P] Add visual test scripts to `portfolio-next/package.json` — `"test:visual": "playwright test tests/e2e/visual-regression.spec.ts"` and `"test:visual:update": "playwright test tests/e2e/visual-regression.spec.ts --update-snapshots"`

**Checkpoint**: GitHub Action runs Lighthouse on every push; fails if any score < 90. `npm run check-links` crawls all pages and validates all links. `npm run test:visual` catches layout regressions across themes and viewports.

---

## Phase 5: US18 — Advanced UX

**Purpose**: Premium interactions and dynamic content. Depends on Phases 0–1 being stable.

### 5.1 — Hero Personalization by Referrer

- [x] T220 [US18] Add referrer-based hero personalization to HeroSection in `portfolio-next/src/components/home/HeroSection.tsx` — detect `searchParams.utm_source` from page props or `document.referrer` (client-side fallback); map known sources to custom subtitle text: `linkedin` → "Welcome from LinkedIn — see my product impact", `github` → "Welcome, fellow builder — explore the code behind the portfolio", `twitter` → "Welcome from X — here's what I've been shipping"; default → existing subtitle; no cookies or tracking; purely URL-based

### 5.2 — Sticky TOC on Case Studies

- [x] T221 [US18] Add two-column layout with sticky TOC sidebar to case study page in `portfolio-next/src/app/projects/[slug]/page.tsx` — desktop (≥1024px): main content column (left, ~70%) + sticky `TableOfContents` sidebar (right, ~30%, `position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto`); mobile (<1024px): hide sidebar, show floating "Jump to section" button fixed at bottom-right
- [x] T222 [US18] [P] Create mobile TOC bottom sheet for case studies — add collapsible drawer component triggered by floating button on mobile in `portfolio-next/src/app/projects/[slug]/page.tsx`; uses existing `TableOfContents` inside a Framer Motion slide-up panel; backdrop overlay; closes on link click or backdrop tap; `aria-modal` for accessibility

### 5.3 — GitHub Activity Integration

- [x] T223 [US18] Create GitHub API utility in `portfolio-next/src/lib/github.ts` — fetch from GitHub REST API (`/users/{username}/repos?sort=updated`, `/users/{username}/events/public`); extract: pinned/recent repos (name, description, language, stars, updated_at), contribution events (last 30 days); cache with ISR (`revalidate: 3600`); use `GITHUB_TOKEN` env var for auth (optional, works without for public repos); graceful fallback returning empty data on API failure
- [x] T224 [US18] [P] Create GitHubActivity component in `portfolio-next/src/components/about/GitHubActivity.tsx` + `GitHubActivity.module.css` — simplified contribution heatmap (CSS grid, 7 rows × 52 cols, 4 intensity levels using accent palette); pinned repos list with language badge, star count, and "Updated X days ago"; loading skeleton state; empty state message if API unavailable
- [x] T225 [US18] Add GitHub activity section to About page in `portfolio-next/src/app/about/page.tsx` — insert `GitHubActivity` component below experience timeline section; pass data fetched server-side via `github.ts` utility
- [x] T226 [US18] [P] Add "Currently Building" section to Now page in `portfolio-next/src/app/now/page.tsx` — fetch recent repos from `github.ts`; display as compact list with repo name, description, last commit date; fallback to static content if API unavailable

**Checkpoint**: `/?utm_source=linkedin` shows personalized hero subtitle. Case studies show sticky TOC sidebar on desktop and floating "Jump to section" button on mobile. `/about` and `/now` display live GitHub activity with graceful fallback.

---

## Phase 6: US19 — Polish

**Purpose**: Final touches for a complete experience. Depends on all above phases being stable.

### 6.1 — Newsletter / Email Signup

- [x] T227 [US19] Create subscribe API route in `portfolio-next/src/app/api/subscribe/route.ts` — POST endpoint accepting `{ email: string }`; validate email format (regex); check for duplicates; store subscribers (append to `content/subscribers.json` or send via Resend API to mailing list); rate limit: 3 requests per IP per hour; return 200 on success, 400 on invalid email, 409 on duplicate, 429 on rate limit
- [x] T228 [US19] [P] Create NewsletterSignup component in `portfolio-next/src/components/blog/NewsletterSignup.tsx` + `NewsletterSignup.module.css` — email input with inline validation; submit button; loading/success/error states; success: show toast "You're subscribed!"; error: show inline message; styled as `GlassCard` with accent gradient border; accessible: `aria-label`, form role, error announcements via `aria-live`
- [x] T229 [US19] Add NewsletterSignup to blog listing page in `portfolio-next/src/app/blog/page.tsx` — position below blog post grid; heading: "Stay in the loop"; subtext: "Get notified when I publish new articles"

### 6.2 — Reading Time on Cards

- [x] T230 [US19] Add reading time display to BlogCard component in `portfolio-next/src/components/blog/BlogCard.tsx` — show `readingTime` from blog frontmatter below title; format as muted text with clock icon; add category `Badge` next to reading time
- [x] T231 [US19] [P] Add duration and role metadata to ProjectCard component in `portfolio-next/src/components/projects/ProjectCard.tsx` — show `duration` and `role` from project data as subtle metadata row below description; use `Badge` component for role

**Checkpoint**: Blog page shows newsletter signup form that stores subscribers. Blog cards display "5 min read" with category badge. Project cards show role and duration metadata.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 0 (Quick Wins) ─────────────────────────► No dependencies
    │
    ├──► T181 (draft types) ──────────────────► Phase 2 (US15) depends on this
    │
Phase 1 (US14: Engagement) ───────────────────► No dependencies (parallel with Phase 0)
    │
Phase 2 (US15: Credibility) ──────────────────► Depends on T181 (draft types from Phase 0)
    │
Phase 3 (US16: Owner Intel) ──────────────────► Depends on @vercel/analytics (already installed)
    │
Phase 4 (US17: CI/Quality) ───────────────────► No dependencies (parallel with all)
    │
    ▼
Phase 5 (US18: Advanced UX) ─────────────────► Depends on Phases 0 + 1 being stable
    │
    ▼
Phase 6 (US19: Polish) ──────────────────────► Depends on all above phases
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| Phase 0 (Quick Wins) | Main tasks Phase 2+ complete | US14, US16, US17 |
| US14 (Engagement) | Main tasks Phase 2+ complete | Phase 0, US16, US17 |
| US15 (Credibility) | T181 (Phase 0 draft types) | US16, US17 |
| US16 (Owner Intel) | @vercel/analytics installed | Phase 0, US14, US15, US17 |
| US17 (CI/Quality) | None | All phases |
| US18 (Advanced UX) | Phase 0 + US14 stable | US17 |
| US19 (Polish) | All above | — (final phase) |

### Parallel Opportunities

Within each phase, tasks marked `[P]` can run in parallel. Key parallel clusters:

- **T180–T183**: Now page CSS + draft types + sitemap update (3 parallel)
- **T189–T190**: Command palette grouping + recency ranking (2 parallel)
- **T191–T193**: Button animations + ripple CSS + magnetic cursor (3 parallel)
- **T197–T198**: Case study frontmatter updates + type updates (2 parallel)
- **T203–T204**: Video type + DemoEmbed component (2 parallel)
- **T206–T213**: All owner intelligence tasks cluster by feature (4 parallel pairs)
- **T214–T219**: All CI/quality tasks (3 parallel pairs)
- **T223–T226**: GitHub integration components (3 parallel)
- **T227–T231**: All polish tasks (3 parallel)

---

## Implementation Strategy

### Execution Priority (from phases.md)

| Order | Tasks | What's Deliverable |
|-------|-------|--------------------|
| **1st** | T179–T180, T181–T183, T185–T186, T187–T188 | `/now` polished, draft mode, RSS feed, reading resume |
| **2nd** | T189–T190, T212–T213, T214–T215, T216–T217 | Command palette polish, OG images, Lighthouse CI, link checker |
| **3rd** | T196–T202, T221–T222, T208–T209 | Metric drill-downs, PDF export, sticky TOC, contact attribution |
| **4th** | T191–T195, T206–T207, T210–T211, T220 | CTA animations, comparison view, scroll tracking, resume tracking, hero personalization |
| **5th** | T223–T226, T227–T229, T230–T231, T203–T205, T218–T219 | GitHub integration, newsletter, reading time on cards, video embeds, visual regression |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total new tasks** | 53 |
| **Phase 0 (Quick Wins)** | 8 tasks |
| **US14 (Engagement)** | 9 tasks |
| **US15 (Credibility)** | 10 tasks |
| **US16 (Owner Intel)** | 8 tasks |
| **US17 (CI/Quality)** | 6 tasks |
| **US18 (Advanced UX)** | 7 tasks |
| **US19 (Polish)** | 5 tasks |
| **Parallel clusters** | 9 major clusters (~30 parallelizable tasks) |
| **New files created** | ~18 |
| **Existing files edited** | ~27 |
| **Suggested first batch** | Phase 0 + T187–T188: 10 tasks |
