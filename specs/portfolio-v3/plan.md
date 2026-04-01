# Implementation Plan: Portfolio v3 — Next.js Migration & Feature Expansion

**Branch**: `portfolio-v3-nextjs` | **Date**: 2026-03-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/portfolio-v3/spec.md`

## Summary

Migrate the existing 14-page static HTML/CSS/vanilla-JS portfolio to a Next.js 14+ App Router application with React Server Components, CSS Modules, and Vercel deployment. Preserve the existing design language (glassmorphism, teal/gold palette, Satoshi/Boska typography) while adding: enhanced SEO (JSON-LD, OG images, sitemap), dynamic theme customization (5 accent palettes), AI-powered client-side content suggestions, data-driven testimonials, real-time GitHub integration via ISR, MDX blog platform, Resend-powered contact form, and progressive AR/VR exploration on case studies.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.3+, Next.js 14.2+  
**Primary Dependencies**: Next.js (App Router), React Three Fiber, Framer Motion, @next/mdx, Chart.js (react-chartjs-2), Resend SDK, next-sitemap, @vercel/analytics, @vercel/speed-insights  
**Storage**: Local JSON/MDX files (content), localStorage (user behavior/theme), Vercel KV or in-memory (rate limiting)  
**Testing**: Vitest (unit), Playwright (E2E), axe-core (accessibility), Lighthouse CI (performance/SEO)  
**Target Platform**: Vercel (production), Node.js 18+ (development)  
**Project Type**: Web application (SSG/ISR hybrid, single frontend, API routes for contact + GitHub proxy)  
**Performance Goals**: Lighthouse > 95 all categories, LCP < 2.0s, FID < 100ms, CLS < 0.05, JS per page < 150KB gzipped  
**Constraints**: Zero cookies, GDPR-friendly analytics, no external CMS, all content in-repo, WCAG 2.1 AA  
**Scale/Scope**: 14 routes, ~20 React components, 4 case studies, 3 blog articles, 1 API route, ISR for GitHub data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Multi-Page Modular Architecture | ✅ EVOLVING | Static HTML → Next.js App Router file-based routing. Still 14 pages, still modular. Architecture improves, intent preserved. |
| II. Depth Over Breadth | ✅ PASS | All 4 case studies + 3 blog articles preserved as dedicated routes with enhanced MDX capabilities. |
| III. Visual-First, Data-Backed | ✅ PASS | 3D hero (React Three Fiber), Chart.js metrics, data-driven testimonials, animated gradient backgrounds all preserved/enhanced. |
| IV. Performance & Accessibility | ✅ PASS | Stricter targets (Lighthouse > 95, LCP < 2.0s). SSR/SSG, code splitting, self-hosted fonts, axe-core testing. |
| V. Enterprise-Grade UX Patterns | ✅ PASS | All patterns preserved (command palette, cursor, toast, transitions, progress bars, filtering, search, carousel, FAQ). Theme customizer added. |
| VI. Technology Stack | ✅ EVOLVING | CDN → npm packages. Three.js → React Three Fiber. GSAP → Framer Motion. Vanilla JS IIFEs → React components. All functional equivalents maintained. |
| VII. File Organization | ✅ EVOLVING | `portfolio/` flat structure → Next.js `app/` directory with component architecture. Content moves to `content/` directory (MDX/JSON). |
| VIII. Simplicity Guardrail | ⚠️ JUSTIFIED | Next.js + npm introduces build tooling (violates "no bundler"). **Justified**: SSR/ISR for SEO, App Router for layouts, code splitting for performance — all directly serve quality gates. |
| IX. Shared Layout Principle | ✅ PASS | `app/layout.tsx` provides root layout (nav, footer, cursor, palette, toast) that persists across all routes. Native App Router behavior. |

### Violations Requiring Justification

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Build tooling (Principle VIII) | Next.js provides SSR/SSG/ISR for SEO, automatic code splitting for performance, API routes for contact form, and `next/image` for image optimization — all directly serving SC-001 through SC-005 | CDN-only approach cannot achieve ISR (GitHub sync), server-side rendering (SEO), or API routes (contact form). Performance gap is unbridgeable without build tools. |
| npm dependencies (Principle VIII) | React Three Fiber, Framer Motion, next-sitemap, Resend SDK require npm — no CDN equivalents that integrate with React component lifecycle | Keeping CDN libs means no tree-shaking, no type safety, no SSR compatibility. DX and bundle size both suffer. |

## Project Structure

### Documentation (this feature)

```text
specs/portfolio-v3/
├── spec.md              # Feature specification (clarified)
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions & rationale
├── data-model.md        # Phase 1: Entity definitions & relationships
├── quickstart.md        # Phase 1: Developer setup guide
└── contracts/           # Phase 1: API contracts
    └── api-contact.md   # Contact form API route contract
```

### Source Code (repository root)

```text
portfolio-next/                     # New Next.js project root
├── .env.local                      # GITHUB_TOKEN, RESEND_API_KEY (gitignored)
├── .env.example                    # Template for required env vars
├── next.config.mjs                 # Next.js config (MDX, images, redirects)
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies & scripts
├── tailwind.config.ts              # NOT USED — CSS Modules only
├── postcss.config.mjs              # PostCSS for CSS processing
│
├── public/                         # Static assets (served as-is)
│   ├── fonts/                      # Self-hosted Satoshi, Boska, JetBrains Mono
│   │   ├── satoshi-variable.woff2
│   │   ├── boska-variable.woff2
│   │   └── jetbrains-mono.woff2
│   ├── images/                     # Static images, OG fallbacks
│   │   └── og-default.png          # Default 1200×630 social preview
│   ├── resume/
│   │   └── dhruv-singhal-resume.pdf
│   └── robots.txt                  # Static robots.txt (or generated)
│
├── content/                        # Content source files
│   ├── projects.json               # Project data (migrated from assets/data/)
│   ├── testimonials.json           # Testimonial data (new — extracted from HTML)
│   ├── case-studies/               # Case study MDX files
│   │   ├── aarkid.mdx
│   │   ├── churn-analysis.mdx
│   │   ├── marketing-effectiveness.mdx
│   │   └── portfolio-site.mdx
│   └── blog/                       # Blog article MDX files
│       ├── why-pms-should-code.mdx
│       ├── data-driven-product-decisions.mdx
│       └── structured-thinking-framework.mdx
│
├── src/                            # Application source
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (nav, footer, cursor, palette, toast, analytics)
│   │   ├── page.tsx                # Home page (/)
│   │   ├── not-found.tsx           # Custom 404 page
│   │   ├── globals.css             # Global CSS (tokens, base, animations)
│   │   ├── about/
│   │   │   └── page.tsx            # About page (/about)
│   │   ├── projects/
│   │   │   ├── page.tsx            # Projects listing (/projects)
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Case study pages (/projects/[slug])
│   │   ├── blog/
│   │   │   ├── page.tsx            # Blog listing (/blog)
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Blog article pages (/blog/[slug])
│   │   ├── contact/
│   │   │   └── page.tsx            # Contact page (/contact)
│   │   ├── now/
│   │   │   └── page.tsx            # Now page (/now)
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts        # Contact form API (Resend)
│   │   └── sitemap.ts              # Dynamic sitemap generation
│   │
│   ├── components/                 # React components
│   │   ├── layout/                 # Layout components
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── Navbar.module.css
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   ├── Footer.module.css
│   │   │   ├── Breadcrumbs.tsx     # Breadcrumb navigation
│   │   │   └── MobileNav.tsx       # Mobile hamburger overlay
│   │   │
│   │   ├── ui/                     # Design system primitives
│   │   │   ├── Button.tsx          # Primary/Secondary/Ghost variants
│   │   │   ├── Button.module.css
│   │   │   ├── GlassCard.tsx       # Glassmorphism card
│   │   │   ├── GlassCard.module.css
│   │   │   ├── Badge.tsx           # Stack chips, status badges
│   │   │   ├── SectionLabel.tsx    # Section heading with label
│   │   │   ├── MetricCounter.tsx   # Animated number counter
│   │   │   ├── Toast.tsx           # Toast notification
│   │   │   ├── LoadingScreen.tsx   # Loading screen with progress
│   │   │   └── SkipLink.tsx        # Accessibility skip link
│   │   │
│   │   ├── interactive/            # Complex interactive components
│   │   │   ├── ThreeHero.tsx       # React Three Fiber 3D hero (client component)
│   │   │   ├── CustomCursor.tsx    # Cursor dot + ring (client component)
│   │   │   ├── CommandPalette.tsx  # Ctrl+K navigation (client component)
│   │   │   ├── ThemeToggle.tsx     # Dark/light toggle (client component)
│   │   │   ├── ThemeCustomizer.tsx # Accent palette picker (client component)
│   │   │   ├── AnimatedGradient.tsx # Background gradient animation
│   │   │   ├── ParticlesBg.tsx     # tsParticles ambient background
│   │   │   └── ARViewer.tsx        # WebXR AR/VR viewer (client, lazy-loaded)
│   │   │
│   │   ├── home/                   # Home page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── MetricsGrid.tsx
│   │   │   ├── FeaturedProjects.tsx
│   │   │   ├── TestimonialCarousel.tsx
│   │   │   ├── BlogTeaser.tsx
│   │   │   └── Suggestions.tsx     # AI-powered content suggestions
│   │   │
│   │   ├── about/                  # About page sections
│   │   │   ├── Philosophy.tsx
│   │   │   ├── SkillsRadar.tsx     # Chart.js radar (client component)
│   │   │   ├── Timeline.tsx
│   │   │   ├── Achievements.tsx
│   │   │   └── GitHubStats.tsx     # GitHub contribution stats
│   │   │
│   │   ├── projects/               # Projects page components
│   │   │   ├── ProjectGrid.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── FilterBar.tsx       # Category filter pills
│   │   │   └── GitHubActivity.tsx  # Pinned repos + heatmap
│   │   │
│   │   ├── case-study/             # Case study page components
│   │   │   ├── CaseStudyHero.tsx
│   │   │   ├── CaseStudyNav.tsx    # Prev/next circular navigation
│   │   │   ├── MetricChart.tsx     # Chart.js visualization (client)
│   │   │   ├── ProcessFlow.tsx     # Step-by-step process diagram
│   │   │   └── RelatedWork.tsx     # AI-powered related suggestions
│   │   │
│   │   ├── blog/                   # Blog components
│   │   │   ├── BlogCard.tsx
│   │   │   ├── BlogSearch.tsx      # Search + filter (client component)
│   │   │   ├── ReadingProgress.tsx # Progress bar (client component)
│   │   │   ├── TableOfContents.tsx # Sticky TOC sidebar (client)
│   │   │   ├── ShareButtons.tsx    # Social sharing
│   │   │   └── RelatedArticles.tsx
│   │   │
│   │   └── contact/                # Contact page components
│   │       ├── ContactForm.tsx     # Form with validation (client)
│   │       ├── FAQAccordion.tsx    # Expandable FAQ
│   │       ├── AvailabilityBadge.tsx
│   │       └── DirectLinks.tsx
│   │
│   ├── lib/                        # Shared utilities & data fetching
│   │   ├── content.ts              # MDX loading, frontmatter parsing
│   │   ├── github.ts               # GitHub GraphQL API client
│   │   ├── suggestions.ts          # AI suggestion scoring engine
│   │   ├── metadata.ts             # SEO metadata generator helpers
│   │   ├── theme.ts                # Theme palettes, CSS var mapping
│   │   └── utils.ts                # General utilities (clamp, debounce, etc.)
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useTheme.ts             # Theme context + localStorage sync
│   │   ├── useBehavior.ts          # User behavior tracking for suggestions
│   │   ├── useReducedMotion.ts     # prefers-reduced-motion detection
│   │   ├── useGPUTier.ts           # GPU capability detection
│   │   └── useIntersection.ts      # IntersectionObserver wrapper
│   │
│   ├── styles/                     # Global & shared CSS
│   │   ├── tokens.css              # Design tokens (migrated from portfolio/css/)
│   │   ├── base.css                # Reset, typography primitives
│   │   ├── animations.css          # Keyframes, motion definitions
│   │   └── print.css               # Print-friendly stylesheet
│   │
│   └── types/                      # TypeScript type definitions
│       ├── project.ts              # Project, CaseStudy types
│       ├── blog.ts                 # BlogArticle, MDX frontmatter types
│       ├── testimonial.ts          # Testimonial type
│       ├── github.ts               # GitHub API response types
│       └── theme.ts                # ThemeConfig, Palette types
│
├── tests/                          # Test suites
│   ├── e2e/                        # Playwright E2E tests
│   │   ├── navigation.spec.ts     # Route navigation, transitions
│   │   ├── seo.spec.ts            # Metadata, structured data
│   │   ├── theme.spec.ts          # Theme toggle, palette persistence
│   │   └── contact.spec.ts        # Contact form submission
│   ├── unit/                       # Vitest unit tests
│   │   ├── suggestions.test.ts    # AI suggestion scoring
│   │   ├── metadata.test.ts       # SEO metadata generation
│   │   └── content.test.ts        # MDX parsing, data loading
│   └── accessibility/              # axe-core accessibility tests
│       └── a11y.spec.ts           # WCAG 2.1 AA per-page checks
│
└── scripts/                        # Build & CI scripts
    ├── generate-og-images.ts       # Build-time OG image generation
    └── lighthouse-ci.ts            # Lighthouse CI configuration
```

**Structure Decision**: Next.js App Router with `src/` directory, component-per-feature organization, CSS Modules for scoping, content files separated into `content/` directory, and TypeScript throughout. This follows Next.js conventions while maintaining the modular architecture principle from the constitution.

## Architecture Decisions

### AD-1: Server vs Client Component Boundary

The App Router defaults to Server Components for zero-JS output. Components needing browser APIs (mouse events, localStorage, Canvas/WebGL, IntersectionObserver) are marked `'use client'`.

**Server Components** (default — zero client JS):
- All page shells (`page.tsx`)
- Layout components (Navbar server part, Footer, Breadcrumbs)
- Content-rendering components (case study sections, blog text)
- SEO metadata generation

**Client Components** (`'use client'` directive):
- ThreeHero, ParticlesBg, AnimatedGradient (Canvas/WebGL)
- CustomCursor (mouse events)
- ThemeToggle, ThemeCustomizer (localStorage + DOM mutation)
- CommandPalette (keyboard events, focus management)
- ContactForm (form state, validation)
- BlogSearch, FilterBar (interactive filtering)
- ReadingProgress, TableOfContents (scroll events)
- TestimonialCarousel (auto-play timer, swipe)
- MetricCounter (IntersectionObserver + animation)
- SkillsRadar, MetricChart (Chart.js canvas)
- Suggestions (localStorage read for behavior data)
- Toast (imperative show/hide API)

### AD-2: Data Flow Architecture

```
content/*.json + content/**/*.mdx
        │
        ▼
  src/lib/content.ts  ◄── Build-time reading (fs)
        │
        ▼
  generateStaticParams()  ◄── SSG route generation
        │
        ▼
  page.tsx (Server Component)  ──► Renders HTML at build time
        │
        ▼
  Client Components receive data via props (serialized)
        │
        ▼
  localStorage (user behavior, theme) ──► Client-only state
```

GitHub data follows a separate ISR path:
```
GitHub GraphQL API
        │
        ▼
  src/lib/github.ts  ◄── fetch() with { next: { revalidate: 3600 } }
        │
        ▼
  Server Component (About, Projects)  ──► Renders with cached data
        │
        ▼
  ISR revalidation (every 1 hour) ──► Vercel rebuilds stale pages
```

### AD-3: CSS Architecture Migration

```
EXISTING (portfolio/css/)          →    NEXT.JS (src/styles/ + *.module.css)
─────────────────────────────           ────────────────────────────────────
tokens.css (design tokens)         →    src/styles/tokens.css (global import in layout)
base.css (reset, typography)       →    src/styles/base.css (global import in layout)
animations.css (keyframes)         →    src/styles/animations.css (global import)
responsive.css (shared queries)    →    Absorbed into component CSS Modules
components.css (nav, footer, etc.) →    Split into component CSS Modules (Navbar.module.css, etc.)
home.css                           →    Split into home/ component modules
about.css                          →    Split into about/ component modules
projects.css                       →    Split into projects/ component modules
case-study.css                     →    Split into case-study/ component modules
blog.css                           →    Split into blog/ component modules
contact.css                        →    Split into contact/ component modules
```

### AD-4: SEO Strategy

| Page Type | Title Pattern | JSON-LD Schema | OG Image |
|-----------|---------------|----------------|----------|
| Home | "Dhruv Singhal — Product Analyst & Builder" | Person + WebSite | Default brand image |
| About | "About Dhruv Singhal \| Product Analyst" | Person + BreadcrumbList | Profile-focused |
| Projects | "Projects \| Dhruv Singhal" | BreadcrumbList | Project collage |
| Case Study | "[Project Name] — Case Study \| Dhruv Singhal" | CreativeWork + BreadcrumbList | Project-specific |
| Blog Listing | "Blog \| Dhruv Singhal" | BreadcrumbList | Blog brand |
| Blog Article | "[Title] \| Dhruv Singhal" | Article + BreadcrumbList | Article-specific |
| Contact | "Contact \| Dhruv Singhal" | FAQPage + BreadcrumbList | Default |
| Now | "Now \| Dhruv Singhal" | BreadcrumbList | Default |
| 404 | "Page Not Found \| Dhruv Singhal" | — | — |

### AD-5: Theme System

```
Root HTML attribute: <html data-theme="dark|light" data-palette="teal|ocean|emerald|amber|mono">

Token override chain:
  1. tokens.css defines [data-theme="dark"] { --bg: #0a0a0b; ... }
  2. tokens.css defines [data-theme="light"] { --bg: #f7f7f8; ... }
  3. tokens.css defines [data-palette="ocean"] { --accent-primary: #3b82f6; ... }
  4. inline <script> in layout.tsx reads localStorage before first paint (prevents FOUC)
```

5 Preset Palettes (all WCAG AA validated):
| Palette | Primary | Secondary | Metric |
|---------|---------|-----------|--------|
| Teal (default) | #5ba4b5 / #2d8a9c | #4a9aa8 | #eab144 / #b8891a |
| Ocean Blue | #3b82f6 / #2563eb | #60a5fa | #f59e0b |
| Emerald | #10b981 / #059669 | #34d399 | #f97316 |
| Warm Amber | #f59e0b / #d97706 | #fbbf24 | #6366f1 |
| Monochrome | #a1a1aa / #71717a | #d4d4d8 | #e4e4e7 |

### AD-6: AI Suggestions Scoring Algorithm

```
score(content) =
    categoryAffinity(content.category) × 0.4     // Weighted by recency
  + tagOverlap(content.tags, userTags) × 0.3     // Jaccard similarity
  + unvisitedBoost(content.slug) × 0.2           // 1.0 if not visited, 0.0 if visited
  + recencyBoost(content.date) × 0.1             // Newer content slightly preferred

categoryAffinity(cat) = visits[cat] / totalVisits × decayFactor(daysSinceLastVisit)
```

All computation runs in `src/lib/suggestions.ts` — pure function, no side effects, testable in isolation.

## Phase Execution Plan

### Phase 0: Project Initialization & Foundation
1. Initialize Next.js 14 project with App Router, TypeScript, CSS Modules
2. Self-host fonts (Satoshi, Boska, JetBrains Mono) in `/public/fonts/`
3. Migrate design tokens (`tokens.css`, `base.css`, `animations.css`) as global CSS
4. Set up root layout with theme script (anti-FOUC), analytics, font preloading

### Phase 1: Design System & Shared Components
5. Build UI primitives: Button, GlassCard, Badge, SectionLabel, MetricCounter, Toast, SkipLink
6. Build layout components: Navbar, Footer, Breadcrumbs, MobileNav
7. Build interactive shared components: CustomCursor, CommandPalette, ThemeToggle, ThemeCustomizer, AnimatedGradient

### Phase 2: Content Infrastructure
8. Set up MDX pipeline (`@next/mdx` + frontmatter parsing) for blog articles and case studies
9. Create content loading utilities (`src/lib/content.ts`) — read JSON + MDX at build time
10. Create SEO metadata utility (`src/lib/metadata.ts`) — generate per-page Head tags + JSON-LD
11. Configure `next-sitemap` for automatic sitemap + robots.txt generation
12. Create TypeScript types for all entities

### Phase 3: Page Migration (P1 pages)
13. Home page: Hero (React Three Fiber), metrics grid, featured projects, testimonial carousel, blog teaser
14. About page: Philosophy, skills radar (Chart.js), timeline, achievements, GitHub stats
15. Projects page: Filter bar, project grid with animated reflow, GitHub activity section
16. Case study pages: Dynamic `[slug]` route, MDX rendering, metric charts, process flow, prev/next nav
17. Blog listing: Search, category filter, article cards
18. Blog article pages: Dynamic `[slug]` route, MDX rendering, reading progress, TOC, related articles

### Phase 4: Feature Addition (P2 features)
19. Theme customization panel (5 palettes, localStorage persistence, command palette integration)
20. AI-powered suggestions engine (`src/lib/suggestions.ts` + `useBehavior` hook + Suggestions component)
21. Data-driven testimonials (enhanced carousel with metrics linked to case studies)
22. GitHub integration (`src/lib/github.ts` + ISR, GitHubStats + GitHubActivity components)
23. Contact form with Resend API route (`app/api/contact/route.ts`)

### Phase 5: Remaining Pages & Polish
24. Contact page (form, FAQ accordion, availability, direct links)
25. Now page
26. 404 page
27. Print stylesheet
28. OG image generation pipeline

### Phase 6: AR/VR & Progressive Enhancement (P3)
29. WebXR AR/VR viewer component (lazy-loaded, progressive enhancement)
30. GPU tier detection hook + 3D performance adaptation

### Phase 7: Testing & Quality
31. Vitest unit tests (suggestions, metadata, content loading)
32. Playwright E2E tests (navigation, theme, SEO, contact form)
33. axe-core accessibility audit on all 14 routes
34. Lighthouse CI pipeline (performance > 95, SEO > 95, a11y > 95, best practices > 95)
35. Cross-browser testing (Chrome, Firefox, Safari, Edge)
36. Responsive testing (320px, 375px, 768px, 1024px, 1440px, 1920px)

### Phase 8: Deployment & Go-Live
37. Configure Vercel project (env vars, build settings, domain)
38. Set up ISR revalidation for GitHub data
39. Verify all quality gates pass on production deployment
40. Redirect old portfolio URLs if domain changes

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Implementation Plan | `specs/portfolio-v3/plan.md` | ✅ This file |
| Research Decisions | `specs/portfolio-v3/research.md` | ✅ Generated |
| Data Model | `specs/portfolio-v3/data-model.md` | ✅ Generated |
| API Contracts | `specs/portfolio-v3/contracts/api-contact.md` | ✅ Generated |
| Quickstart Guide | `specs/portfolio-v3/quickstart.md` | ✅ Generated |
