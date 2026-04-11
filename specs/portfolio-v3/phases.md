# Portfolio V3 — UX Improvement Phases

**Created**: 2026-04-05  
**Status**: Planning  
**Scope**: 22 features across 7 phases (0–6)

---

## Phase 0: Quick Wins

> **Goal**: Close visible gaps with minimal complexity. No dependencies.

### 0.1 — Finish `/now` Page
- **Current state**: Static stub with hardcoded "March 2026" dates, 5 sections
- **Change**: Add `lastUpdated` date display, brief intro paragraph, polished styling
- **Files**:
  - Edit `src/app/now/page.tsx` — add formatted date, richer content structure
  - Edit `src/app/now/now.module.css` — polish layout (timeline-style sections, accent borders)
- **Acceptance**: Page renders with current-month content, responsive, print-friendly

### 0.2 — Draft Mode for Content
- **Current state**: All MDX files always render in all environments
- **Change**: Add `draft: true` frontmatter support; filter drafts from production builds
- **Files**:
  - Edit `src/lib/content.ts` — `getAllBlogPosts()` and `getAllCaseStudies()` filter where `frontmatter.draft !== true` unless `process.env.NODE_ENV === 'development'`
  - Edit `src/types/` — add `draft?: boolean` to `BlogArticle` and `CaseStudy` types
  - Edit `src/app/sitemap.ts` — exclude drafts from sitemap generation
- **Acceptance**: Adding `draft: true` to any MDX file hides it from prod listing/sitemap but shows in `npm run dev`

### 0.3 — Content Scaffolding Script
- **Current state**: `scripts/` directory is empty
- **Change**: Node script to create new blog post or case study from template
- **Files**:
  - Create `scripts/new-content.ts` — prompts for type (blog/case-study), slug, title; generates MDX with frontmatter template; updates `projects.json` if case study
- **Usage**: `npx tsx scripts/new-content.ts --type blog --slug my-new-post --title "My New Post"`

### 0.4 — RSS Feed
- **Current state**: No RSS/Atom feed
- **Change**: Next.js route handler that generates RSS XML from blog posts
- **Files**:
  - Create `src/app/feed.xml/route.ts` — reads `getAllBlogPosts()`, generates RSS 2.0 XML
  - Edit `src/app/layout.tsx` — add `<link rel="alternate" type="application/rss+xml">` to `<head>`
- **Acceptance**: `/feed.xml` returns valid RSS with all published blog posts

**Checkpoint**: `/now` polished, drafts hidden in prod, content scaffolding works, RSS validates.

---

## Phase 1: Visitor Engagement

> **Goal**: Make the site stickier and more interactive for recruiters/collaborators. No dependencies on other phases.

### 1.1 — Reading Progress Persistence
- **Current state**: `ReadingProgress.tsx` tracks scroll position but doesn't persist
- **Change**: Save scroll percentage + slug to localStorage; on revisit, show "Resume where you left off?" toast
- **Files**:
  - Edit `src/components/blog/ReadingProgress.tsx` — save `{ slug, progress, timestamp }` to localStorage on scroll (debounced)
  - Edit `src/app/blog/[slug]/page.tsx` — on mount, check localStorage; if entry exists for this slug with progress > 10%, trigger toast with "Resume reading" action that scrolls to saved position
  - Uses existing `Toast` component — no new dependencies
- **Acceptance**: Leave a blog article at 50%, return later → toast offers to resume at 50%

### 1.2 — Enhanced Command Palette
- **Current state**: 13 nav items + theme toggle, flat list, fuzzy search
- **Change**: Add action shortcuts, group by category, rank by recency
- **Files**:
  - Edit `src/components/interactive/CommandPalette.tsx`:
    - Add actions: "Download Resume" (link to `/assets/resume/`), "Toggle Dark Mode", "Copy Page URL"
    - Group results by type: Pages | Case Studies | Blog | Actions
    - Read `useBehavior().pagesVisited` to boost recently viewed items in ranking
    - Add keyboard shortcut hints (e.g., `T` next to "Toggle Theme")
- **Acceptance**: Ctrl+K shows grouped results; recently visited pages appear first; actions work

### 1.3 — Micro-Interaction Feedback on CTAs
- **Current state**: `Button.tsx` exists with variants; `CustomCursor.tsx` has dot+ring
- **Change**: Add magnetic hover effect on primary buttons; subtle scale+ripple on click
- **Files**:
  - Edit `src/components/ui/Button.tsx` — add Framer Motion `whileHover` (scale 1.02) and `whileTap` (scale 0.98) props; add ripple effect on click via CSS pseudo-element
  - Edit `src/components/ui/Button.module.css` — ripple keyframe animation
  - Edit `src/components/interactive/CustomCursor.tsx` — detect `data-magnetic` attribute on hover targets; apply cursor attraction toward button center
- **Acceptance**: Hovering "View Case Study" buttons shows magnetic cursor pull + subtle scale; clicking shows ripple. Reduced-motion: static hover only.

### 1.4 — Project Comparison View
- **Current state**: `/projects` has `ProjectGrid`, `ProjectCard`, `FilterBar`
- **Change**: Add toggle between grid view and comparison table view
- **Files**:
  - Create `src/components/projects/ComparisonTable.tsx` — renders all projects in a responsive table (columns: Project, Role, Stack, Key Metric, Duration)
  - Edit `src/app/projects/page.tsx` — add view toggle state (`grid` | `table`), conditionally render `ProjectGrid` or `ComparisonTable`
  - Create `src/components/projects/ComparisonTable.module.css`
- **Acceptance**: Toggle button switches between card grid and scannable table; mobile: table scrolls horizontally

**Checkpoint**: Blog reading resumes, command palette is grouped + smart, CTAs feel premium, projects scannable in table view.

---

## Phase 2: Credibility & Depth

> **Goal**: Make case studies the portfolio's strongest differentiator. Depends on Phase 0.2 for content conventions.

### 2.1 — Interactive Metric Drill-Downs
- **Current state**: Case study metrics display as static `MetricCounter` components
- **Change**: Click a metric to expand a detail panel showing methodology, baseline, and context
- **Files**:
  - Create `src/components/ui/MetricDetail.tsx` — expandable panel with Framer Motion `AnimatePresence`; props: `{ value, label, methodology, baseline, timeframe }`
  - Edit case study MDX frontmatter — add `methodology` and `baseline` fields to each metric entry in all 4 case study files
  - Edit case study page template (`src/app/projects/[slug]/page.tsx`) — render `MetricDetail` instead of plain `MetricCounter` for case study metrics
- **Acceptance**: Clicking "+28% ROI" expands panel: "Baseline: $X/month → $Y/month over 3 months. Methodology: A/B test across 4 channels."

### 2.2 — PDF Export for Case Studies
- **Current state**: `print.css` exists, hides nav/footer/cursor/3D elements
- **Change**: Add "Download PDF" button on case studies that triggers `window.print()` with enhanced print styles
- **Files**:
  - Edit `src/styles/print.css` — add case-study-specific print rules: branded header with name+URL, metric cards in 2-column grid, code blocks with borders
  - Create `src/components/ui/PrintButton.tsx` — button that calls `window.print()`, hidden in print media
  - Edit case study layout — add `PrintButton` in page header area
- **Acceptance**: "Download as PDF" → browser print dialog → clean branded PDF with metrics, text, code blocks. No 3D, no nav.

### 2.3 — Video/Demo Embeds on Case Studies
- **Current state**: Case studies are text + metrics only
- **Change**: Add optional `demoUrl` and `videoUrl` fields to case study frontmatter; render embedded player or link
- **Files**:
  - Edit case study MDX frontmatter schema in types — add `demoUrl?: string`, `videoUrl?: string`
  - Create `src/components/ui/DemoEmbed.tsx` — responsive iframe wrapper with lazy loading, fallback thumbnail
  - Edit case study page template — conditionally render `DemoEmbed` if URL provided
- **Acceptance**: Case studies with video show embedded player; without video, no empty space

**Checkpoint**: Case studies have expandable metrics, PDF export, optional video demos.

---

## Phase 3: Owner Intelligence

> **Goal**: Give the portfolio owner visibility into how visitors interact with the site. Depends on existing Vercel Analytics.

### 3.1 — Scroll Depth Tracking
- **Current state**: Vercel Analytics tracks page views only
- **Change**: Fire custom events at 25/50/75/100% scroll depth per page
- **Files**:
  - Create `src/hooks/useScrollDepth.ts` — IntersectionObserver at 4 sentinel positions; fires `window.va?.track('scroll_depth', { page, depth })` once per threshold per session
  - Edit `src/app/layout.tsx` or page-level components — mount `useScrollDepth` on case study and blog article pages
- **Acceptance**: Vercel Analytics dashboard shows scroll depth events; you can see which sections get read

### 3.2 — Contact Attribution
- **Current state**: Contact form logs to console; no source tracking
- **Change**: Track which page the visitor came from before hitting `/contact`
- **Files**:
  - Edit `src/app/contact/page.tsx` — read `document.referrer` or `useBehavior().pagesVisited` last entry; include as hidden field in form submission
  - Edit `src/app/api/contact/route.ts` — accept optional `referringPage` field; include in email/log
- **Acceptance**: Contact submissions include "Came from: /projects/aarkid" context

### 3.3 — Resume Download Tracking
- **Current state**: Resume linked as static file
- **Change**: Track download clicks via Vercel Analytics custom event
- **Files**:
  - Create `src/components/ui/TrackedLink.tsx` — wrapper that fires `va?.track('resume_download')` on click before navigation
  - Edit any page that links to resume (About, Nav) — use `TrackedLink` instead of plain `<a>`
- **Acceptance**: Resume downloads appear as events in Vercel Analytics

### 3.4 — OG Image Generation
- **Current state**: No dynamic OG images
- **Change**: Auto-generate branded OG cards per page using Next.js `ImageResponse`
- **Files**:
  - Create `src/app/og/route.tsx` — accepts `?title=X&metric=Y&type=case-study` query params; returns 1200×630 PNG with branded layout (dark bg, Satoshi font, accent gradient)
  - Edit `src/lib/seo.ts` (metadata utils) — set `og:image` to `/og?title=...` for each page dynamically
- **Acceptance**: Sharing any page on LinkedIn/Twitter shows branded card with title + key metric

**Checkpoint**: Scroll depth visible in analytics, contact form shows referrer, resume downloads tracked, social shares show branded cards.

---

## Phase 4: Quality Gates & CI

> **Goal**: Automate quality enforcement. No dependencies, fully parallelizable with other phases.

### 4.1 — Lighthouse CI GitHub Action
- **Current state**: No CI workflows for portfolio-v3
- **Change**: GitHub Action that runs Lighthouse on every push; fails if any score < 90
- **Files**:
  - Create `.github/workflows/lighthouse.yml` — uses `treosh/lighthouse-ci-action`; tests 6 key routes (`/`, `/about`, `/projects`, `/blog`, `/contact`, `/now`); asserts all 4 categories ≥ 90
  - Create `portfolio-v3/lighthouserc.json` — config with URL list and assertions
- **Dependency**: Needs deployed preview URL (Vercel preview deployments) or local build + serve

### 4.2 — Broken Link Checker
- **Current state**: No link validation
- **Change**: Script that crawls all pages and validates internal + external links
- **Files**:
  - Create `scripts/check-links.ts` — builds the site (`next build`), serves locally, crawls all routes, extracts all `<a href>` and `<link>`, validates each; reports broken links with exit code 1
  - Add to `package.json` scripts: `"check-links": "npx tsx scripts/check-links.ts"`
- **Acceptance**: `npm run check-links` → "14 pages crawled, 87 links checked, 0 broken" or fails with list

### 4.3 — Visual Regression Tests
- **Current state**: Playwright installed but no visual tests
- **Change**: Screenshot comparison tests across themes and viewports
- **Files**:
  - Create `tests/e2e/visual-regression.spec.ts` — for each of 6 key routes × 2 themes × 2 viewports (mobile/desktop) = 24 screenshots; compare against baseline
  - Add baseline update script to `package.json`: `"test:visual:update": "playwright test --update-snapshots"`
- **Acceptance**: `npx playwright test visual-regression` passes; any layout regression fails with diff image

**Checkpoint**: Lighthouse ≥ 90 enforced, zero broken links validated on every push, visual regressions caught.

---

## Phase 5: Advanced UX

> **Goal**: Premium interactions and dynamic content. Depends on Phases 0–1 being stable.

### 5.1 — Hero Personalization by Referrer
- **Current state**: Hero is the same for everyone
- **Change**: Detect UTM params or `document.referrer`; customize hero subtitle/CTA
- **Files**:
  - Edit `src/components/home/HeroSection.tsx` — read `searchParams` (from page props) or `document.referrer`; map known sources to custom messages:
    - LinkedIn → "Welcome from LinkedIn — see my product impact"
    - GitHub → "Welcome, fellow builder — explore the code behind the portfolio"
    - Default → existing copy
  - No tracking/cookies; purely URL-based
- **Acceptance**: `/?utm_source=linkedin` shows personalized hero text; no UTM = default

### 5.2 — Sticky TOC on Case Studies
- **Current state**: `TableOfContents.tsx` exists with IntersectionObserver active highlighting
- **Change**: Integrate into case study layout as persistent sidebar (desktop) / collapsible drawer (mobile)
- **Files**:
  - Edit `src/app/projects/[slug]/page.tsx` — two-column layout: main content (left) + sticky TOC sidebar (right, `position: sticky; top: 80px`)
  - Edit case study page CSS — responsive: sidebar hidden on mobile, replaced by floating "Jump to section" button that opens a bottom sheet
  - `TableOfContents.tsx` already works — just needs layout integration
- **Acceptance**: Desktop: sticky sidebar shows section links; clicking jumps with scroll. Mobile: floating button → bottom sheet

### 5.3 — GitHub Activity Integration
- **Current state**: Not started (T120-T124)
- **Change**: Show recent GitHub activity on `/now` page and `/about` page
- **Files**:
  - Create `src/lib/github.ts` — fetch from GitHub REST API (no GraphQL needed for basic data): pinned repos, contribution count, recent commits; cache with ISR (`revalidate: 3600`)
  - Create `src/components/about/GitHubActivity.tsx` — contribution heatmap (simplified CSS grid), pinned repos list
  - Edit `src/app/now/page.tsx` — add "Currently Building" section pulling from GitHub
  - Edit `src/app/about/page.tsx` — add GitHub section
- **Dependency**: Needs `GITHUB_TOKEN` in `.env.local` for higher rate limits (optional; works without for public repos)
- **Acceptance**: `/now` and `/about` show live GitHub data; graceful fallback if API unavailable

**Checkpoint**: Hero adapts to referrer, case studies have sticky navigation, GitHub activity pulls live.

---

## Phase 6: Polish

> **Goal**: Final touches for a complete experience. Depends on all above.

### 6.1 — Newsletter / Email Signup
- **Change**: Simple email capture form on blog listing page
- **Files**:
  - Create `src/components/blog/NewsletterSignup.tsx` — email input + submit; stores in a simple JSON file or sends via Resend to a mailing list
  - Edit `src/app/blog/page.tsx` — add component below blog listing
  - Create `src/app/api/subscribe/route.ts` — POST endpoint, validates email, appends to list
- **Acceptance**: Valid email → success toast; invalid → error; no duplicate subscriptions

### 6.2 — Reading Time on Cards
- **Current state**: `readingTime` exists in blog frontmatter but may not show on listing cards
- **Change**: Surface reading time + category badge on `BlogCard` and `ProjectCard`
- **Files**:
  - Edit `src/components/blog/BlogCard.tsx` — add reading time below title
  - Edit `src/components/projects/ProjectCard.tsx` — add duration/role tag
- **Acceptance**: Blog cards show "5 min read"; project cards show role + duration

**Checkpoint**: Newsletter captures emails, cards show reading time and metadata.

---

## Dependency Graph

```
Phase 0 (Quick Wins) ──────────────────────────┐
  0.1 /now page                                 │
  0.2 Draft mode ──────► Phase 2 (Credibility)  │
  0.3 Content script                            │
  0.4 RSS feed                                  │
                                                │
Phase 1 (Engagement) ──────────────────────────►├──► Phase 5 (Advanced)
  1.1 Reading progress persist                  │      5.1 Hero personalization
  1.2 Command palette enhance                   │      5.2 Sticky TOC
  1.3 CTA micro-interactions                    │      5.3 GitHub integration
  1.4 Project comparison view                   │
                                                │
Phase 3 (Owner Intel) ─────────────────────────►├──► Phase 6 (Polish)
  3.1 Scroll depth tracking                     │      6.1 Newsletter
  3.2 Contact attribution                       │      6.2 Reading time on cards
  3.3 Resume download tracking                  │
  3.4 OG image generation                       │
                                                │
Phase 4 (CI/Quality) ──────────────────────────►┘
  4.1 Lighthouse CI
  4.2 Broken link checker
  4.3 Visual regression tests
```

## Execution Priority

| Order | Items | Rationale |
|-------|-------|-----------|
| **1st** | 0.1, 0.2, 0.4, 1.1 | Close visible gaps, immediate user value, small scope |
| **2nd** | 1.2, 3.4, 4.1, 4.2 | Command palette polish + CI prevents regressions |
| **3rd** | 2.1, 2.2, 5.2, 3.2 | Case study depth is the differentiator — make it shine |
| **4th** | 1.3, 1.4, 3.1, 3.3, 5.1 | Engagement polish + analytics visibility |
| **5th** | 5.3, 6.1, 6.2, 2.3, 4.3 | Nice-to-haves once core is solid |

## Feature Count by Phase

| Phase | Features | New Files | Edited Files |
|-------|----------|-----------|-------------|
| 0 | 4 | 2 | 4 |
| 1 | 4 | 2 | 5 |
| 2 | 3 | 3 | 6 |
| 3 | 4 | 3 | 4 |
| 4 | 3 | 4 | 1 |
| 5 | 3 | 2 | 5 |
| 6 | 2 | 2 | 2 |
| **Total** | **23** | **18** | **27** |
