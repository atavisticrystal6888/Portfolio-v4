# Tasks: Portfolio v3 — Next.js Migration & Feature Expansion

**Input**: Design documents from `specs/portfolio-v3/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included in final phase (Lighthouse CI, Playwright E2E, Vitest unit, axe-core a11y) as specified in spec SC-001 through SC-012.

**Organization**: Tasks grouped by user story. 13 user stories mapped from spec.md (US1–US13). Setup and foundational phases precede all stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US13)
- All paths relative to `portfolio-next/` project root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project, install dependencies, configure tooling

- [X] T001 Initialize Next.js 14 App Router project with TypeScript and `src/` directory in `portfolio-next/`
- [X] T002 Install core dependencies: `framer-motion`, `@react-three/fiber`, `@react-three/drei`, `three`, `react-chartjs-2`, `chart.js`, `@next/mdx`, `@mdx-js/loader`, `gray-matter`, `next-sitemap`, `resend`, `@vercel/analytics`, `@vercel/speed-insights` in `portfolio-next/package.json`
- [X] T003 [P] Install dev dependencies: `@types/three`, `@types/mdx`, `vitest`, `@testing-library/react`, `playwright`, `@axe-core/playwright` in `portfolio-next/package.json`
- [X] T004 [P] Create `.env.example` with all required env vars (`GITHUB_TOKEN`, `GITHUB_USERNAME`, `RESEND_API_KEY`, `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`) in `portfolio-next/.env.example`
- [X] T005 [P] Create `.env.local` template (gitignored) in `portfolio-next/.env.local`
- [X] T006 Configure `next.config.mjs` with MDX support, image formats (AVIF/WebP), page extensions in `portfolio-next/next.config.mjs`
- [X] T007 [P] Configure TypeScript strict mode in `portfolio-next/tsconfig.json`
- [X] T008 [P] Create project directory structure: `src/components/`, `src/lib/`, `src/hooks/`, `src/styles/`, `src/types/`, `content/`, `tests/` in `portfolio-next/`

**Checkpoint**: `pnpm dev` starts without errors, empty Next.js app runs at localhost:3000

---

## Phase 2: Foundational (Design System & Shared Infrastructure)

**Purpose**: Migrate design tokens, self-host fonts, build root layout, and create shared UI components. MUST complete before ANY user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### CSS & Font Migration

- [X] T009 Migrate `portfolio/css/tokens.css` to `portfolio-next/src/styles/tokens.css` — preserve all CSS custom properties, add `[data-palette]` variants for 5 accent palettes (teal, ocean, emerald, amber, mono) per plan.md AD-5
- [X] T010 [P] Migrate `portfolio/css/base.css` to `portfolio-next/src/styles/base.css` — replace Fontshare CDN `@import` with local `@font-face` declarations pointing to `/fonts/`
- [X] T011 [P] Migrate `portfolio/css/animations.css` to `portfolio-next/src/styles/animations.css` — preserve keyframes, add Framer Motion CSS hooks, keep `prefers-reduced-motion` support
- [X] T012 [P] Create `portfolio-next/src/styles/print.css` with print-friendly rules (hide nav, footer, cursor, 3D canvas)
- [ ] T013 [P] Download and place self-hosted fonts in `portfolio-next/public/fonts/`: `satoshi-variable.woff2`, `boska-variable.woff2`, `jetbrains-mono.woff2`
- [X] T014 Create `portfolio-next/src/app/globals.css` importing `tokens.css`, `base.css`, `animations.css`, `print.css`

### TypeScript Types

- [X] T015 [P] Create Project and CaseStudy types in `portfolio-next/src/types/project.ts` per data-model.md
- [X] T016 [P] Create BlogArticle type in `portfolio-next/src/types/blog.ts` per data-model.md
- [X] T017 [P] Create Testimonial type in `portfolio-next/src/types/testimonial.ts` per data-model.md
- [X] T018 [P] Create GitHubProfile and PinnedRepo types in `portfolio-next/src/types/github.ts` per data-model.md
- [X] T019 [P] Create ThemeConfig, Palette, and UserBehavior types in `portfolio-next/src/types/theme.ts` per data-model.md

### Content Migration

- [X] T020 Migrate `portfolio/assets/data/projects.json` to `portfolio-next/content/projects.json` — add new fields (`githubUrl`, `duration`, `role`, `order`) per data-model.md
- [X] T021 [P] Create `portfolio-next/content/testimonials.json` — extract testimonial data from `portfolio/index.html`, add `projectSlug`, `outcomeMetric`, `relationship` fields per data-model.md
- [X] T022 [P] Convert `portfolio/case-studies/aarkid.html` to `portfolio-next/content/case-studies/aarkid.mdx` with frontmatter (slug, title, subtitle, role, duration, stack, tldr, metrics, prevSlug, nextSlug)
- [X] T023 [P] Convert `portfolio/case-studies/churn-analysis.html` to `portfolio-next/content/case-studies/churn-analysis.mdx` with frontmatter
- [X] T024 [P] Convert `portfolio/case-studies/marketing-effectiveness.html` to `portfolio-next/content/case-studies/marketing-effectiveness.mdx` with frontmatter
- [X] T025 [P] Convert `portfolio/case-studies/portfolio-site.html` to `portfolio-next/content/case-studies/portfolio-site.mdx` with frontmatter
- [X] T026 [P] Convert `portfolio/blog/why-pms-should-code.html` to `portfolio-next/content/blog/why-pms-should-code.mdx` with frontmatter (slug, title, date, category, tags, readingTime, excerpt)
- [X] T027 [P] Convert `portfolio/blog/data-driven-product-decisions.html` to `portfolio-next/content/blog/data-driven-product-decisions.mdx` with frontmatter
- [X] T028 [P] Convert `portfolio/blog/structured-thinking-framework.html` to `portfolio-next/content/blog/structured-thinking-framework.mdx` with frontmatter
- [X] T029 [P] Copy `portfolio/assets/resume/` to `portfolio-next/public/resume/`

### Shared Utilities

- [X] T030 Create content loading utility in `portfolio-next/src/lib/content.ts` — functions: `getAllProjects()`, `getProjectBySlug()`, `getAllCaseStudies()`, `getCaseStudyBySlug()`, `getAllBlogPosts()`, `getBlogPostBySlug()`, `getAllTestimonials()` reading from `content/` directory
- [X] T031 [P] Create SEO metadata utility in `portfolio-next/src/lib/metadata.ts` — functions: `generatePageMetadata()`, `generateJsonLd()`, `generateBreadcrumbJsonLd()` for per-page Head tags + JSON-LD structured data per plan.md AD-4
- [X] T032 [P] Create general utilities in `portfolio-next/src/lib/utils.ts` — `clamp()`, `debounce()`, `formatDate()`, `slugify()`, `cn()` class name helper

### Custom Hooks

- [X] T033 [P] Create `useTheme` hook in `portfolio-next/src/hooks/useTheme.ts` — read/write ThemeConfig from localStorage, provide `mode`, `palette`, `toggleMode()`, `setPalette()`, anti-FOUC inline script generation
- [X] T034 [P] Create `useReducedMotion` hook in `portfolio-next/src/hooks/useReducedMotion.ts` — detect `prefers-reduced-motion: reduce` media query
- [X] T035 [P] Create `useIntersection` hook in `portfolio-next/src/hooks/useIntersection.ts` — IntersectionObserver wrapper for scroll-triggered animations
- [X] T036 [P] Create `useGPUTier` hook in `portfolio-next/src/hooks/useGPUTier.ts` — detect GPU capability via `WEBGL_debug_renderer_info`, return tier (high/medium/low/fallback)

### UI Primitives (Design System)

- [X] T037 [P] Create Button component (primary/secondary/ghost variants) in `portfolio-next/src/components/ui/Button.tsx` + `Button.module.css`
- [X] T038 [P] Create GlassCard component (glassmorphism card with blur) in `portfolio-next/src/components/ui/GlassCard.tsx` + `GlassCard.module.css`
- [X] T039 [P] Create Badge component (stack chips, status badges) in `portfolio-next/src/components/ui/Badge.tsx` + `Badge.module.css`
- [X] T040 [P] Create SectionLabel component (section heading with accent label) in `portfolio-next/src/components/ui/SectionLabel.tsx` + `SectionLabel.module.css`
- [X] T041 [P] Create MetricCounter component (animated number counter with IntersectionObserver trigger) in `portfolio-next/src/components/ui/MetricCounter.tsx` + `MetricCounter.module.css`
- [X] T042 [P] Create Toast component (success/error/info notification system) in `portfolio-next/src/components/ui/Toast.tsx` + `Toast.module.css`
- [X] T043 [P] Create SkipLink component (accessibility skip-to-content) in `portfolio-next/src/components/ui/SkipLink.tsx`
- [X] T044 [P] Create LoadingScreen component (progress bar animation) in `portfolio-next/src/components/ui/LoadingScreen.tsx` + `LoadingScreen.module.css`

### Layout Components

- [X] T045 Create Navbar component (logo, nav links, theme toggle, command palette trigger, CTA, mobile hamburger) in `portfolio-next/src/components/layout/Navbar.tsx` + `Navbar.module.css`
- [X] T046 [P] Create Footer component (links, social icons, copyright) in `portfolio-next/src/components/layout/Footer.tsx` + `Footer.module.css`
- [X] T047 [P] Create Breadcrumbs component (dynamic breadcrumb trail from route path) in `portfolio-next/src/components/layout/Breadcrumbs.tsx` + `Breadcrumbs.module.css`
- [X] T048 [P] Create MobileNav component (full-screen hamburger overlay) in `portfolio-next/src/components/layout/MobileNav.tsx` + `MobileNav.module.css`

### Interactive Shared Components

- [X] T049 Create CustomCursor component ('use client' — dot + ring, magnetic hover, hidden on touch) in `portfolio-next/src/components/interactive/CustomCursor.tsx` + `CustomCursor.module.css`
- [X] T050 Create CommandPalette component ('use client' — Ctrl+K, fuzzy search, all 14 pages + case studies + articles + actions) in `portfolio-next/src/components/interactive/CommandPalette.tsx` + `CommandPalette.module.css`
- [X] T051 Create ThemeToggle component ('use client' — dark/light toggle button with icon swap) in `portfolio-next/src/components/interactive/ThemeToggle.tsx` + `ThemeToggle.module.css`
- [X] T052 Create AnimatedGradient component ('use client' — ambient background gradient between accent colors) in `portfolio-next/src/components/interactive/AnimatedGradient.tsx` + `AnimatedGradient.module.css`

### Root Layout

- [X] T053 Create root layout in `portfolio-next/src/app/layout.tsx` — import globals.css, anti-FOUC inline theme script, font preload `<link>`, Navbar, Footer, CustomCursor, CommandPalette, Toast provider, Vercel Analytics, Vercel Speed Insights, `<html data-theme data-palette>` attributes
- [X] T054 Create `portfolio-next/src/app/globals.css` entry point importing all global styles

**Checkpoint**: Root layout renders with Navbar, Footer, cursor, command palette, theme toggle, and all UI primitives available. Both dark/light themes work. Fonts load from `/fonts/`.

---

## Phase 3: User Story 1 — Next.js App Shell & Page Routing (Priority: P1) 🎯 MVP

**Goal**: All 14 routes render with SSG, client-side navigation works with transitions, shared layout persists across navigation.

**Independent Test**: Navigate Home → About → Projects → Case Study → Blog → Contact. No full-page reload, theme persists, nav highlights active route.

### Implementation

- [x] T055 [US1] Create Home page route in `portfolio-next/src/app/page.tsx` — server component shell with metadata export, placeholder content sections
- [x] T056 [P] [US1] Create About page route in `portfolio-next/src/app/about/page.tsx` — server component with metadata
- [x] T057 [P] [US1] Create Projects page route in `portfolio-next/src/app/projects/page.tsx` — server component with metadata, load projects from `content/projects.json`
- [x] T058 [P] [US1] Create dynamic case study route in `portfolio-next/src/app/projects/[slug]/page.tsx` — `generateStaticParams()` from case study MDX files, `generateMetadata()` per case study
- [x] T059 [P] [US1] Create Blog listing route in `portfolio-next/src/app/blog/page.tsx` — server component with metadata, load posts from content
- [x] T060 [P] [US1] Create dynamic blog article route in `portfolio-next/src/app/blog/[slug]/page.tsx` — `generateStaticParams()` from blog MDX files, `generateMetadata()` per article
- [x] T061 [P] [US1] Create Contact page route in `portfolio-next/src/app/contact/page.tsx` — server component with metadata
- [x] T062 [P] [US1] Create Now page route in `portfolio-next/src/app/now/page.tsx` — server component with metadata
- [x] T063 [P] [US1] Create custom 404 page in `portfolio-next/src/app/not-found.tsx` — PM-themed personality message with link home
- [x] T064 [US1] Add Framer Motion page transition wrapper in `portfolio-next/src/app/template.tsx` — `AnimatePresence` with fade/slide enter/exit animations (<200ms perceived)
- [x] T065 [US1] Verify all 14 routes build with `pnpm build` — confirm SSG output for all static routes, dynamic routes generate from `generateStaticParams()`

**Checkpoint**: `pnpm build` succeeds. All 14 routes accessible. Client-side navigation between pages is instant. Shared layout (nav, footer, cursor, palette) persists.

---

## Phase 4: User Story 2 — Component Architecture & Design System (Priority: P1)

**Goal**: All UI elements from existing 14 pages are React components. No inline style duplication. Both themes render with identical dimensions.

**Independent Test**: Toggle theme on every page — verify no layout shift (CLS = 0), all components update colors correctly.

### Implementation

- [x] T066 [US2] Audit all existing pages and create component inventory: map every HTML element to its React component equivalent in a checklist, ensuring 100% coverage against `portfolio/css/components.css`
- [x] T067 [US2] Verify all UI primitives (T037–T044) render correctly in both dark and light themes — test each variant, interactive state (hover/focus/active/disabled), and WCAG AA contrast
- [x] T068 [US2] Verify all layout components (T045–T048) render responsively at 320px, 768px, 1024px, 1440px viewports
- [x] T069 [US2] Create any missing components identified in T066 audit, placing them in appropriate `portfolio-next/src/components/` subdirectory with CSS Modules

**Checkpoint**: Component library covers all UI elements, both themes work without layout shift on all components.

---

## Phase 5: User Story 3 — Advanced SEO & Metadata (Priority: P1)

**Goal**: Every page has unique metadata, JSON-LD structured data, auto-generated sitemap, and social preview images. Lighthouse SEO > 95.

**Independent Test**: Run Lighthouse SEO audit on each route. Validate structured data with Rich Results Test format. Check OG previews.

### Implementation

- [x] T070 [US3] Implement `generateMetadata()` in Home page `portfolio-next/src/app/page.tsx` — title, description, OG tags, Twitter Card, canonical URL, JSON-LD `Person` + `WebSite` schema
- [x] T071 [P] [US3] Implement `generateMetadata()` in About page `portfolio-next/src/app/about/page.tsx` — Person schema + BreadcrumbList
- [x] T072 [P] [US3] Implement `generateMetadata()` in Projects page `portfolio-next/src/app/projects/page.tsx` — BreadcrumbList
- [x] T073 [P] [US3] Implement dynamic `generateMetadata()` in case study route `portfolio-next/src/app/projects/[slug]/page.tsx` — CreativeWork schema + BreadcrumbList, per-project OG title/description
- [x] T074 [P] [US3] Implement `generateMetadata()` in Blog listing `portfolio-next/src/app/blog/page.tsx` — BreadcrumbList
- [x] T075 [P] [US3] Implement dynamic `generateMetadata()` in blog article route `portfolio-next/src/app/blog/[slug]/page.tsx` — Article schema + BreadcrumbList, `article:published_time`, `article:author`
- [x] T076 [P] [US3] Implement `generateMetadata()` in Contact page `portfolio-next/src/app/contact/page.tsx` — FAQPage schema + BreadcrumbList
- [x] T077 [P] [US3] Implement `generateMetadata()` in Now page `portfolio-next/src/app/now/page.tsx` — BreadcrumbList
- [x] T078 [US3] Create dynamic sitemap in `portfolio-next/src/app/sitemap.ts` — all 14 routes with `lastmod` dates and priority values
- [x] T079 [P] [US3] Create `portfolio-next/public/robots.txt` allowing all crawlers, referencing sitemap URL
- [x] T080 [US3] Create OG image generation script in `portfolio-next/scripts/generate-og-images.ts` — produce 1200×630 social preview images per page type using `@vercel/og` or build-time canvas rendering
- [x] T175 [P] [US3] Create dynamic OG image route in `portfolio-next/src/app/og/[...slug]/route.tsx` — `next/og` ImageResponse for per-page social previews (page title, description, accent palette, dark/light mode variant), referenced from each page's `generateMetadata()` as `og:image`

**Checkpoint**: Every route has unique title, description, OG tags, JSON-LD. `/sitemap.xml` and `/robots.txt` accessible. Lighthouse SEO > 95 on all routes.

---

## Phase 6: User Story 4 — Responsive Design Excellence (Priority: P1)

**Goal**: Flawless rendering at 320px–1920px+. Touch-friendly on mobile. No overflow anywhere.

**Independent Test**: Test every page at 320px, 375px, 768px, 1024px, 1440px, 1920px viewports.

### Implementation

- [x] T081 [US4] Implement fluid typography using CSS `clamp()` for all heading levels (h1–h4) and body text in `portfolio-next/src/styles/base.css`
- [x] T082 [US4] Ensure all interactive elements have ≥44×44px touch targets on mobile — audit Button, Badge, nav links, filter pills, carousel dots, FAQ toggles across all components
- [x] T083 [US4] Implement mobile hamburger ↔ full nav bar responsive transition in Navbar component `portfolio-next/src/components/layout/Navbar.tsx` at 768px breakpoint
- [x] T084 [US4] Add responsive grid rules to project grid (1-col mobile, 2-col tablet, 3-col desktop) in `portfolio-next/src/components/projects/ProjectGrid.tsx`
- [x] T085 [US4] Add responsive rules to all page sections — ensure max-width 1200px container, full-width backgrounds on ultrawide, no horizontal scroll on any viewport
- [x] T086 [US4] Make CommandPalette render as full-screen modal on mobile viewports in `portfolio-next/src/components/interactive/CommandPalette.tsx`

**Checkpoint**: All pages render correctly at all breakpoints. No horizontal scroll, no overflow, no truncated content.

---

## Phase 7: User Story 5 — Interactive 3D Hero & Animated Backgrounds (Priority: P1)

**Goal**: Home page 3D particle sphere renders with mouse interaction, GPU-adaptive quality, theme-reactive colors. Animated gradient on all pages.

**Independent Test**: Load Home on capable desktop (particles render) and low-end device (fallback renders). Toggle theme — particles change color.

### Implementation

- [x] T087 [US5] Create ThreeHero component ('use client') in `portfolio-next/src/components/interactive/ThreeHero.tsx` — React Three Fiber particle sphere (1500 particles high-end, 500 low-end), mouse-reactive rotation, auto-spin, theme-reactive colors via `useTheme` hook
- [x] T088 [US5] Integrate `useGPUTier` hook in ThreeHero — adapt particle count and animation complexity based on detected GPU tier (high/medium/low)
- [x] T089 [US5] Create CSS gradient fallback for ThreeHero when WebGL unavailable — animated gradient hero with typed text in `portfolio-next/src/components/interactive/ThreeHero.tsx`
- [x] T090 [US5] Implement `prefers-reduced-motion` support in ThreeHero and AnimatedGradient — disable all particle/gradient animations, show static visuals
- [x] T091 [US5] Create ParticlesBg component ('use client', lazy-loaded) in `portfolio-next/src/components/interactive/ParticlesBg.tsx` — tsParticles ambient background for Home page
- [x] T092 [US5] Integrate ThreeHero + ParticlesBg + AnimatedGradient into Home page `portfolio-next/src/app/page.tsx`

**Checkpoint**: Home hero renders 3D particles on capable devices, gradient fallback on others. AnimatedGradient subtly shifts on all pages. All animations respect reduced-motion.

---

## Phase 8: User Story 11 — Blog & Article Platform (Priority: P1)

**Goal**: Blog listing with search/filter, article pages with MDX rendering, reading progress, TOC, code highlighting.

**Independent Test**: Open blog listing, search for a term, filter by category. Open article — verify progress bar, TOC highlights, code blocks highlighted.

### Implementation

- [ ] T093 [US11] Create BlogCard component in `portfolio-next/src/components/blog/BlogCard.tsx` + `BlogCard.module.css` — title, excerpt, date, category tag, reading time, thumbnail
- [ ] T094 [P] [US11] Create BlogSearch component ('use client') in `portfolio-next/src/components/blog/BlogSearch.tsx` + `BlogSearch.module.css` — search input with real-time filtering (≤200ms debounce), category pills, highlighted matches, URL parameter persistence
- [ ] T095 [P] [US11] Create ReadingProgress component ('use client') in `portfolio-next/src/components/blog/ReadingProgress.tsx` + `ReadingProgress.module.css` — scroll-proportional progress bar
- [ ] T096 [P] [US11] Create TableOfContents component ('use client') in `portfolio-next/src/components/blog/TableOfContents.tsx` + `TableOfContents.module.css` — auto-generated from h2/h3 headings, sticky sidebar, active section highlighting via IntersectionObserver
- [ ] T097 [P] [US11] Create ShareButtons component in `portfolio-next/src/components/blog/ShareButtons.tsx` — native share API with clipboard fallback
- [ ] T098 [P] [US11] Create RelatedArticles component in `portfolio-next/src/components/blog/RelatedArticles.tsx` + `RelatedArticles.module.css` — show 2-3 related articles by tag/category overlap
- [ ] T099 [US11] Integrate blog components into blog listing page `portfolio-next/src/app/blog/page.tsx` — BlogSearch + BlogCard grid
- [ ] T100 [US11] Integrate article components into blog article page `portfolio-next/src/app/blog/[slug]/page.tsx` — MDX rendering, ReadingProgress, TableOfContents sidebar, ShareButtons, RelatedArticles, Prism.js/Shiki syntax highlighting for code blocks

**Checkpoint**: Blog listing shows all articles with working search and filters. Article pages render MDX with progress bar, TOC, code highlighting, and related articles.

---

## Phase 9: User Story 13 — Performance & Core Web Vitals (Priority: P1)

**Goal**: Lighthouse > 95 all categories, LCP < 2.0s, CLS < 0.05, JS per page < 150KB gzipped.

**Independent Test**: Run Lighthouse on all 14 routes — all must pass > 95 threshold.

### Implementation

- [x] T101 [US13] Configure `next/image` for all images across all pages — lazy loading, WebP/AVIF formats, appropriate `sizes` attribute for viewport-based art direction
- [x] T102 [US13] Add font preload `<link rel="preload">` tags in root layout `portfolio-next/src/app/layout.tsx` for Satoshi and Boska woff2 files with `font-display: swap`
- [x] T103 [US13] Audit and optimize per-page JavaScript bundles — ensure heavy client components (ThreeHero, Chart.js, CommandPalette) use `next/dynamic` with `ssr: false` where appropriate, verify total JS < 150KB gzipped per page (excluding Three.js async chunk on Home)
- [x] T104 [US13] Configure Vercel Analytics in root layout `portfolio-next/src/app/layout.tsx` — `<Analytics />` + `<SpeedInsights />` components
- [x] T105 [US13] Create Lighthouse CI config in `portfolio-next/scripts/lighthouse-ci.ts` — run against all 14 routes, assert Performance > 95, Accessibility > 95, Best Practices > 95, SEO > 95
- [x] T176 [P] [US13] Configure `next/image` wrapper component in `portfolio-next/src/components/ui/OptimizedImage.tsx` — default `sizes`, `placeholder="blur"`, AVIF/WebP `formats` in `next.config.mjs`, enforce `width`/`height` or `fill` to prevent CLS; integrate across all page components

**Checkpoint**: `pnpm build` produces optimized bundles. Lighthouse > 95 on all four categories for all routes.

---

## Phase 10: User Story 6 — Dynamic Theme Customization (Priority: P2)

**Goal**: 5 preset accent palettes selectable via UI panel. Persists across sessions. All palettes WCAG AA compliant.

**Independent Test**: Open theme customizer, select each palette. Verify all components update. Refresh — palette persists.

### Implementation

- [ ] T106 [US6] Create theme palette definitions in `portfolio-next/src/lib/theme.ts` — 5 palettes (teal, ocean, emerald, amber, mono) with CSS custom property mappings, AA contrast pre-validation
- [ ] T107 [US6] Create ThemeCustomizer component ('use client') in `portfolio-next/src/components/interactive/ThemeCustomizer.tsx` + `ThemeCustomizer.module.css` — palette picker panel accessible via settings icon + command palette, preview swatches, apply via `data-palette` attribute on `<html>`
- [ ] T108 [US6] Extend `useTheme` hook in `portfolio-next/src/hooks/useTheme.ts` to support palette selection persisted in localStorage alongside mode (dark/light)
- [ ] T109 [US6] Update anti-FOUC inline script in root layout to read and apply `data-palette` from localStorage before first paint
- [ ] T110 [US6] Add "theme" and "color" actions to CommandPalette in `portfolio-next/src/components/interactive/CommandPalette.tsx` — palette switching via Ctrl+K

**Checkpoint**: All 5 palettes apply correctly across all pages. Persists on refresh. Command palette integration works.

---

## Phase 11: User Story 7 — AI-Powered Content Suggestions (Priority: P2)

**Goal**: Client-side behavioral signals drive content recommendations. "Recommended for you" sections appear contextually.

**Independent Test**: Visit 2 Data-category pages, return to Home — suggestions prioritize Data content. Clear localStorage — defaults to featured.

### Implementation

- [ ] T111 [US7] Create `useBehavior` hook in `portfolio-next/src/hooks/useBehavior.ts` — track pages visited, scroll depths, category affinities, timestamps in localStorage per UserBehavior schema
- [ ] T112 [US7] Create suggestion scoring engine in `portfolio-next/src/lib/suggestions.ts` — implement scoring algorithm from plan.md AD-6: `categoryAffinity × 0.4 + tagOverlap × 0.3 + unvisitedBoost × 0.2 + recencyBoost × 0.1`, cold-start default to featured content
- [ ] T113 [US7] Create Suggestions component ('use client') in `portfolio-next/src/components/home/Suggestions.tsx` + `Suggestions.module.css` — "Recommended for you" section, renders scored content cards
- [ ] T114 [P] [US7] Create RelatedWork component ('use client') in `portfolio-next/src/components/case-study/RelatedWork.tsx` + `RelatedWork.module.css` — case study bottom "Related Work" using same scoring engine
- [ ] T115 [US7] Integrate Suggestions into Home page (below featured projects) `portfolio-next/src/app/page.tsx` and RelatedWork into case study pages `portfolio-next/src/app/projects/[slug]/page.tsx`

**Checkpoint**: Suggestions adapt based on browsing behavior. Cold-start shows featured content. localStorage clear resets to defaults.

---

## Phase 12: User Story 8 — Data-Driven Testimonials (Priority: P2)

**Goal**: Testimonial carousel with quantifiable metrics linked to case studies. Metrics match case study outcomes.

**Independent Test**: View carousel. Each card has metric. Click "View Case Study" — navigates correctly. Cross-reference metric with case study.

### Implementation

- [ ] T116 [US8] Create TestimonialCarousel component ('use client') in `portfolio-next/src/components/home/TestimonialCarousel.tsx` + `TestimonialCarousel.module.css` — auto-play 8s, pause on hover/focus, dot navigation, swipe gestures on mobile, display name/title/company/quote/metric/relationship per testimonial
- [ ] T117 [US8] Add animated MetricCounter to each testimonial card — highlight `outcomeMetric` value with subtle count-up animation
- [ ] T118 [US8] Add "View Case Study" link per testimonial card linking to `/projects/[projectSlug]`
- [ ] T119 [US8] Integrate TestimonialCarousel into Home page `portfolio-next/src/app/page.tsx` — pass testimonials data from `content/testimonials.json`

**Checkpoint**: Carousel displays all testimonials with metrics. Metrics match linked case study outcomes (single source of truth). Navigation works.

---

## Phase 13: User Story 9 — Real-Time GitHub Integration (Priority: P2)

**Goal**: GitHub pinned repos, contribution heatmap, and stats display on Projects and About pages via ISR.

**Independent Test**: Verify GitHub data renders. Wait for ISR revalidation window. Verify data updates. Block API — verify cached fallback with timestamp.

### Implementation

- [ ] T120 [US9] Create GitHub GraphQL API client in `portfolio-next/src/lib/github.ts` — fetch pinned repos, contribution calendar, total contributions, top languages, streak. Use `fetch()` with `{ next: { revalidate: 3600 } }` for ISR. Handle rate limiting with cached fallback + "Last updated" timestamp.
- [ ] T121 [US9] Create GitHubActivity component in `portfolio-next/src/components/projects/GitHubActivity.tsx` + `GitHubActivity.module.css` — pinned repos (name, description, language badge, stars, forks), contribution heatmap (365 days), "View Case Study" link if `matchedProjectSlug` exists
- [ ] T122 [P] [US9] Create GitHubStats component in `portfolio-next/src/components/about/GitHubStats.tsx` + `GitHubStats.module.css` — total repos, total contributions, top 5 languages, longest streak
- [ ] T123 [US9] Integrate GitHubActivity into Projects page `portfolio-next/src/app/projects/page.tsx` — fetch GitHub data in server component, pass to client component
- [ ] T124 [US9] Integrate GitHubStats into About page `portfolio-next/src/app/about/page.tsx` — fetch GitHub data in server component

**Checkpoint**: GitHub data renders on Projects and About pages. ISR revalidation configured at 1 hour. API failure shows cached data.

---

## Phase 14: User Story 12 — Contact & Outreach (Priority: P2)

**Goal**: Contact form submits to Resend API route. Client + server validation. FAQ accordion.

**Independent Test**: Submit valid form — receive email. Submit invalid — see inline errors. Submit 6 times — get rate limited.

### Implementation

- [ ] T125 [US12] Create contact form API route in `portfolio-next/src/app/api/contact/route.ts` — Resend SDK email delivery, server-side input sanitization, rate limiting (5 per IP per hour), response format per `contracts/api-contact.md`
- [ ] T126 [US12] Create ContactForm component ('use client') in `portfolio-next/src/components/contact/ContactForm.tsx` + `ContactForm.module.css` — name/email/subject/message fields, client-side validation (name required, email regex, message ≥20 chars), inline error messages, success toast, fallback mailto: on server error
- [ ] T127 [P] [US12] Create FAQAccordion component in `portfolio-next/src/components/contact/FAQAccordion.tsx` + `FAQAccordion.module.css` — keyboard navigable (Enter/Space toggle, Arrow keys between), ARIA `role="region"` + `aria-expanded`, smooth expand/collapse animation
- [ ] T128 [P] [US12] Create AvailabilityBadge component in `portfolio-next/src/components/contact/AvailabilityBadge.tsx` + `AvailabilityBadge.module.css`
- [ ] T129 [P] [US12] Create DirectLinks component in `portfolio-next/src/components/contact/DirectLinks.tsx` + `DirectLinks.module.css` — email (copy-to-clipboard), LinkedIn, GitHub links
- [ ] T130 [US12] Integrate contact components into Contact page `portfolio-next/src/app/contact/page.tsx`

**Checkpoint**: Contact form delivers emails via Resend. Validation works client + server side. FAQ accordion is keyboard accessible. Rate limiting prevents abuse.

---

## Phase 15: User Story 10 — AR/VR Project Exploration (Priority: P3)

**Goal**: WebXR AR/VR mode on select case study pages. Progressive enhancement — hidden on unsupported devices.

**Independent Test**: Open case study on WebXR device — "Explore in 3D" button visible, opens 3D scene. On unsupported device — button hidden, Mermaid diagram shown instead.

### Implementation

- [ ] T131 [US10] Create ARViewer component ('use client', `next/dynamic` lazy-loaded) in `portfolio-next/src/components/interactive/ARViewer.tsx` + `ARViewer.module.css` — `@react-three/xr` integration, `<XR>`, `<ARButton>`, `<VRButton>`, project architecture as 3D model (nodes, connections)
- [ ] T132 [US10] Add WebXR feature detection — only render "Explore in 3D" / "View in AR" buttons when `navigator.xr` reports immersive session support
- [ ] T133 [US10] Create Mermaid/static diagram fallback for case study pages without WebXR support
- [ ] T134 [US10] Integrate ARViewer into case study page template `portfolio-next/src/app/projects/[slug]/page.tsx` — lazy-load with `next/dynamic`, show fallback diagram when WebXR unavailable

**Checkpoint**: AR/VR works on compatible devices. Graceful fallback on all others. No bundle impact on non-AR pages (lazy-loaded).

---

## Phase 16: Remaining Page Content

**Purpose**: Complete full content for all page sections not yet built.

### Home Page Sections

- [ ] T135 Create HeroSection component in `portfolio-next/src/components/home/HeroSection.tsx` + `HeroSection.module.css` — hero text, typed roles (Framer Motion or Typed.js equivalent), CTAs
- [ ] T136 [P] Create MetricsGrid component in `portfolio-next/src/components/home/MetricsGrid.tsx` + `MetricsGrid.module.css` — 5 KPI metric counters with animated reveal
- [ ] T137 [P] Create FeaturedProjects component in `portfolio-next/src/components/home/FeaturedProjects.tsx` + `FeaturedProjects.module.css` — 3 featured project cards with hover effects
- [ ] T138 [P] Create BlogTeaser component in `portfolio-next/src/components/home/BlogTeaser.tsx` + `BlogTeaser.module.css` — 3 recent article cards + "Read All" link
- [ ] T139 Assemble full Home page in `portfolio-next/src/app/page.tsx` — HeroSection, ThreeHero, MetricsGrid, about teaser, FeaturedProjects, TestimonialCarousel, Suggestions, BlogTeaser, contact CTA

### About Page Sections

- [ ] T140 Create Philosophy component in `portfolio-next/src/components/about/Philosophy.tsx` + `Philosophy.module.css` — product philosophy cards
- [ ] T141 [P] Create SkillsRadar component ('use client') in `portfolio-next/src/components/about/SkillsRadar.tsx` + `SkillsRadar.module.css` — Chart.js radar chart, 6 axes, dual datasets, theme-reactive
- [ ] T142 [P] Create Timeline component in `portfolio-next/src/components/about/Timeline.tsx` + `Timeline.module.css` — experience timeline with staggered Framer Motion animations
- [ ] T143 [P] Create Achievements component in `portfolio-next/src/components/about/Achievements.tsx` + `Achievements.module.css`
- [ ] T144 Assemble full About page in `portfolio-next/src/app/about/page.tsx` — bio, Philosophy, SkillsRadar, Timeline, Achievements, GitHubStats, resume download

### Projects Page

- [ ] T145 Create ProjectCard component in `portfolio-next/src/components/projects/ProjectCard.tsx` + `ProjectCard.module.css` — hover tilt effect, stack chips, metric badge, "Read Case Study" link
- [ ] T146 [P] Create FilterBar component ('use client') in `portfolio-next/src/components/projects/FilterBar.tsx` + `FilterBar.module.css` — category pills (All/Product/Data/AI/Technical), animated card reflow on filter
- [ ] T147 [P] Create ProjectGrid component in `portfolio-next/src/components/projects/ProjectGrid.tsx` + `ProjectGrid.module.css` — responsive grid with Framer Motion layout animations
- [ ] T148 Assemble full Projects page in `portfolio-next/src/app/projects/page.tsx` — FilterBar, ProjectGrid, GitHubActivity

### Case Study Pages

- [ ] T149 Create CaseStudyHero component in `portfolio-next/src/components/case-study/CaseStudyHero.tsx` + `CaseStudyHero.module.css` — title, role, duration, stack chips banner
- [ ] T150 [P] Create CaseStudyNav component in `portfolio-next/src/components/case-study/CaseStudyNav.tsx` + `CaseStudyNav.module.css` — prev/next circular navigation (aarkid ↔ churn ↔ marketing ↔ portfolio ↔ aarkid)
- [ ] T151 [P] Create MetricChart component ('use client') in `portfolio-next/src/components/case-study/MetricChart.tsx` + `MetricChart.module.css` — Chart.js visualization from frontmatter `metrics` data, theme-reactive, scroll-triggered animation
- [ ] T152 [P] Create ProcessFlow component in `portfolio-next/src/components/case-study/ProcessFlow.tsx` + `ProcessFlow.module.css` — numbered step-by-step process diagram
- [ ] T153 Assemble full case study page template in `portfolio-next/src/app/projects/[slug]/page.tsx` — CaseStudyHero, TL;DR, MDX content sections, MetricChart, ProcessFlow, CaseStudyNav, RelatedWork, ReadingProgress

### Now Page

- [ ] T154 Create Now page content in `portfolio-next/src/app/now/page.tsx` — current work, learning, reading, building sections per existing `portfolio/now.html`

**Checkpoint**: All 14 pages fully assembled with complete content. All sections render correctly.

---

## Phase 17: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, testing, accessibility, final optimization.

### Scroll Animations

- [ ] T155 Add Framer Motion scroll-triggered entrance animations (fade-in + translateY) to all page sections across all pages — respect `useReducedMotion` hook
- [ ] T156 [P] Add hover/focus/active states to all interactive elements (buttons, cards, links, filter pills) across all components

### Testing

- [ ] T157 Create Vitest unit tests for suggestion scoring engine in `portfolio-next/tests/unit/suggestions.test.ts`
- [ ] T158 [P] Create Vitest unit tests for metadata generation in `portfolio-next/tests/unit/metadata.test.ts`
- [ ] T159 [P] Create Vitest unit tests for content loading in `portfolio-next/tests/unit/content.test.ts`
- [ ] T160 Create Playwright E2E test for navigation and page transitions in `portfolio-next/tests/e2e/navigation.spec.ts`
- [ ] T161 [P] Create Playwright E2E test for SEO metadata and structured data in `portfolio-next/tests/e2e/seo.spec.ts`
- [ ] T162 [P] Create Playwright E2E test for theme toggle and palette persistence in `portfolio-next/tests/e2e/theme.spec.ts`
- [ ] T163 [P] Create Playwright E2E test for contact form submission in `portfolio-next/tests/e2e/contact.spec.ts`
- [ ] T164 Create axe-core accessibility tests for all 14 routes in `portfolio-next/tests/accessibility/a11y.spec.ts` — WCAG 2.1 AA compliance check per route

### Final Quality

- [ ] T165 Run Lighthouse CI against all 14 routes — assert all scores > 95
- [ ] T166 Cross-browser testing: Chrome, Firefox, Safari, Edge — verify no rendering issues
- [ ] T167 [P] Responsive testing at 320px, 375px, 768px, 1024px, 1440px, 1920px — verify no overflow or layout issues on any page
- [ ] T168 Verify zero console errors across all 14 routes
- [ ] T169 Verify zero broken internal links across all 14 routes
- [ ] T170 Run `pnpm build` final production build — verify all routes generate, bundle sizes within limits
- [ ] T177 [P] Validate print stylesheet across all 14 routes — verify `portfolio-next/src/styles/print.css` hides nav, footer, cursor, 3D canvas, command palette; verify readable single-column layout, no blank pages, correct heading hierarchy in Chrome + Firefox print preview
- [ ] T178 [P] Automated touch-target validation — run axe-core `target-size` rule at 320px and 375px viewports across all 14 routes in Playwright; assert all interactive elements ≥44×44px touch area per WCAG 2.5.8

**Checkpoint**: All quality gates pass. Lighthouse > 95 all categories. Zero console errors. Zero broken links. WCAG AA compliant.

---

## Phase 18: Deployment

**Purpose**: Production deployment to Vercel.

- [ ] T171 Configure Vercel project — connect GitHub repo, set environment variables (`GITHUB_TOKEN`, `GITHUB_USERNAME`, `RESEND_API_KEY`, `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`)
- [ ] T172 Deploy to Vercel production — verify ISR revalidation for GitHub data, API route for contact form, analytics tracking
- [ ] T173 Verify all quality gates on production URL — Lighthouse, structured data, OG previews, contact form delivery
- [ ] T174 Configure custom domain (if applicable) and verify canonical URLs + sitemap reference correct domain

**Checkpoint**: Portfolio live on production. All features working. ISR refreshing GitHub data hourly.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────► No dependencies
    │
    ▼
Phase 2 (Foundational) ──────────────────────► Depends on Phase 1
    │
    ▼ ⚠️ BLOCKS ALL USER STORIES
    │
    ├──► Phase 3 (US1: Routing)  ─────────────► Depends on Phase 2
    │       │
    │       ▼
    ├──► Phase 4 (US2: Components) ───────────► Depends on Phase 3 (routes exist)
    ├──► Phase 5 (US3: SEO) ──────────────────► Depends on Phase 3 (routes exist)
    ├──► Phase 6 (US4: Responsive) ───────────► Depends on Phase 4 (components exist)
    ├──► Phase 7 (US5: 3D Hero) ──────────────► Depends on Phase 2 (hooks exist)
    ├──► Phase 8 (US11: Blog) ────────────────► Depends on Phase 3 (routes exist)
    ├──► Phase 9 (US13: Performance) ─────────► Depends on Phase 7, 8 (heavy components exist)
    │
    ├──► Phase 10 (US6: Theme Palettes) ──────► Depends on Phase 2 (useTheme exists)
    ├──► Phase 11 (US7: AI Suggestions) ──────► Depends on Phase 2 (content utils exist)
    ├──► Phase 12 (US8: Testimonials) ────────► Depends on Phase 2 (content data exists)
    ├──► Phase 13 (US9: GitHub) ──────────────► Depends on Phase 3 (routes exist)
    ├──► Phase 14 (US12: Contact) ────────────► Depends on Phase 3 (routes exist)
    │
    ├──► Phase 15 (US10: AR/VR) ──────────────► Depends on Phase 7 (3D infra exists)
    │
    ▼
Phase 16 (Full Content) ─────────────────────► Depends on Phases 3–15 (all components)
    │
    ▼
Phase 17 (Polish & Testing) ─────────────────► Depends on Phase 16 (all content)
    │
    ▼
Phase 18 (Deployment) ───────────────────────► Depends on Phase 17 (quality gates)
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| US1 (Routing) | Phase 2 only | — (must be first) |
| US2 (Components) | US1 | US3, US5, US11 |
| US3 (SEO) | US1 | US2, US5, US11 |
| US4 (Responsive) | US2 | US5, US6, US7 |
| US5 (3D Hero) | Phase 2 | US2, US3, US11 |
| US6 (Theme) | Phase 2 | US7, US8, US9 |
| US7 (Suggestions) | Phase 2 | US6, US8, US9 |
| US8 (Testimonials) | Phase 2 | US6, US7, US9 |
| US9 (GitHub) | US1 | US6, US7, US8 |
| US10 (AR/VR) | US5 | US12 |
| US11 (Blog) | US1 | US2, US3, US5 |
| US12 (Contact) | US1 | US6, US7, US8 |
| US13 (Performance) | US5, US11 | — (needs heavy components) |

### Parallel Opportunities

Within each phase, tasks marked `[P]` can run in parallel. Key parallel clusters:

- **T015–T019**: All TypeScript type files (5 parallel)
- **T022–T029**: All content MDX conversions (7 parallel)
- **T037–T044**: All UI primitives (8 parallel)
- **T045–T048**: All layout components (4 parallel)
- **T055–T063**: All page route shells (9 parallel)
- **T070–T077**: All metadata implementations (8 parallel)
- **T093–T098**: All blog components (6 parallel)
- **T157–T164**: All test files (8 parallel)

---

## Implementation Strategy

### MVP First (Phase 1 → 2 → 3)

1. Complete Phase 1: Setup — project initialized
2. Complete Phase 2: Foundational — design system, layout, content infrastructure
3. Complete Phase 3: US1 (Routing) — all 14 routes render with SSG
4. **STOP and VALIDATE**: All routes accessible, navigation works, shared layout persists
5. Deploy preview to Vercel

### Incremental Delivery

| Increment | Phases | What's Deliverable |
|-----------|--------|--------------------|
| **MVP** | 1 → 2 → 3 | 14 routes with SSG, shared layout, theme toggle |
| **+Content** | 4 → 5 → 8 → 16 | Full page content, SEO metadata, blog platform |
| **+Visual** | 6 → 7 | Responsive polish, 3D hero, animated backgrounds |
| **+Intelligence** | 10 → 11 → 12 → 13 → 14 | Theme palettes, AI suggestions, testimonials, GitHub, contact form |
| **+Showcase** | 15 | AR/VR progressive enhancement |
| **+Quality** | 9 → 17 | Performance optimization, full test suite |
| **+Live** | 18 | Production deployment |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 174 |
| **Setup phase** | 8 tasks |
| **Foundational phase** | 46 tasks |
| **User story tasks** | 80 tasks (across 13 stories) |
| **Content assembly** | 20 tasks |
| **Polish & testing** | 16 tasks |
| **Deployment** | 4 tasks |
| **Parallel clusters** | 8 major clusters (~55 parallelizable tasks) |
| **Suggested MVP scope** | Phases 1–3 (US1 only): 73 tasks |
