# Feature Specification: Dhruv Singhal Portfolio v3 — Next.js Migration & Feature Expansion

**Feature Branch**: `portfolio-v3-nextjs`  
**Created**: 2026-03-31  
**Status**: Clarified  
**Input**: Convert the existing 14-page static HTML/CSS portfolio to a full Next.js + React frontend application. Improve SEO optimization. Add responsive design enhancements, interactive features (3D hero, theme customization, animated gradients, AR/VR project exploration), AI-powered content suggestions, data-driven testimonials, and real-time GitHub/Dribbble sync.

---

## User Scenarios & Testing

### User Story 1 — Next.js App Shell & Page Routing (Priority: P1)

A visitor navigates to any of the 14 portfolio routes. The application loads as a server-side rendered Next.js app with file-based routing. Each page is pre-rendered at build time (SSG) for performance and SEO. Client-side navigation between pages is instant with no full-page reloads, preserving scroll position, theme state, and animation continuity. The shared layout (nav, footer, cursor, command palette) persists across route changes without remounting.

**Why this priority**: This is the foundational migration — every other feature depends on the Next.js app shell, routing, and component architecture being in place.

**Independent Test**: Navigate between Home → About → Projects → Case Study → Blog → Contact. Verify no full-page reload occurs, theme persists, nav highlights the active route, and each page renders correctly with SSR/SSG.

**Acceptance Scenarios**:

1. **Given** the app is deployed, **When** a crawler or user requests any page URL directly, **Then** the server returns fully-rendered HTML with all meta tags, structured data, and visible content (no client-side-only rendering)
2. **Given** the user is on the Home page, **When** they click a nav link to Projects, **Then** Next.js client-side router navigates instantly (<200ms), the shared layout persists, and only the page content transitions
3. **Given** 14 page routes exist, **When** the app builds, **Then** all routes are statically generated (SSG) with `generateStaticParams()` and async server components; dynamic routes (case studies, blog articles) generate pages from data files
4. **Given** the user navigates to a non-existent route, **When** Next.js handles the 404, **Then** the custom 404 page renders with the PM-themed personality message

---

### User Story 2 — Component Architecture & Design System (Priority: P1)

All UI elements from the existing 14 pages are converted into reusable React components organized in a design-system-first architecture. Design tokens (colors, spacing, typography, elevation) migrate from `tokens.css` to a combination of CSS custom properties and a theme provider. Components are composable, accessible, and support both dark and light themes without layout shift.

**Why this priority**: Components are the building blocks for every page. Without a clean component library, page construction is duplicative and inconsistent.

**Independent Test**: Render the component library in Storybook or a test page. Verify each component renders in both themes, responds to all interactive states (hover, focus, active, disabled), and passes WCAG 2.1 AA contrast checks.

**Acceptance Scenarios**:

1. **Given** the design system is built, **When** any page is composed, **Then** it uses only shared components (GlassCard, Button, Badge, SectionLabel, MetricCounter, etc.) — no inline style duplication
2. **Given** a component receives theme context, **When** theme toggles from dark to light, **Then** the component re-renders with updated CSS custom properties and no layout shift (CLS = 0)
3. **Given** the existing CSS architecture (tokens, base, components, animations, responsive + 6 page-specific files), **When** migrated, **Then** CSS Modules (`.module.css`) scope styles per component while `tokens.css`, `base.css`, and `animations.css` remain as global CSS imports

---

### User Story 3 — Advanced SEO & Metadata Optimization (Priority: P1)

Every page has comprehensive SEO metadata generated via Next.js `<Head>` or the App Router metadata API. This includes dynamic `<title>`, `<meta description>`, Open Graph tags, Twitter Card tags, canonical URLs, JSON-LD structured data (Person, WebSite, Article, BreadcrumbList, FAQPage), and a dynamically generated sitemap. The site achieves Lighthouse SEO score > 95 on every page.

**Why this priority**: SEO is a primary driver for portfolio discoverability. Recruiters, hiring managers, and collaborators find the portfolio through search engines.

**Independent Test**: Run Lighthouse on each page and verify SEO score > 95. Validate structured data with Google's Rich Results Test. Check Open Graph previews with social media debuggers (Facebook, Twitter, LinkedIn).

**Acceptance Scenarios**:

1. **Given** the Home page, **When** crawled, **Then** it has: unique `<title>` ("Dhruv Singhal — Product Analyst & Builder"), meta description (≤160 chars), `og:title`, `og:description`, `og:image` (1200×630 social preview), `og:type=website`, `twitter:card=summary_large_image`, canonical URL, and JSON-LD `Person` + `WebSite` schema
2. **Given** a blog article page, **When** crawled, **Then** it has: article-specific title, description from excerpt, `og:type=article`, `article:published_time`, `article:author`, JSON-LD `Article` schema with `headline`, `datePublished`, `author`, `image`, and `BreadcrumbList`
3. **Given** a case study page, **When** crawled, **Then** it has: case study title + "| Dhruv Singhal" as title, project-specific description, JSON-LD `CreativeWork` schema with `about`, `skills`, `creator`
4. **Given** the contact page, **When** crawled, **Then** it has JSON-LD `FAQPage` schema for the FAQ accordion
5. **Given** the site is deployed, **When** `/sitemap.xml` is requested, **Then** it returns an auto-generated sitemap with all 14 page URLs, correct `lastmod` dates, and priority levels
6. **Given** the site is deployed, **When** `/robots.txt` is requested, **Then** it allows all crawlers and references the sitemap URL

---

### User Story 4 — Responsive Design Excellence (Priority: P1)

The portfolio renders flawlessly across all device categories: mobile (320px–767px), tablet (768px–1023px), desktop (1024px–1440px), and ultrawide (1441px+). Every interactive element is touch-friendly on mobile. Typography, spacing, and layout adapt fluidly using CSS clamp(), container queries, and responsive breakpoints. No horizontal scroll, no text overflow, no truncated content on any viewport.

**Why this priority**: Recruiters frequently browse portfolios on mobile devices. A broken mobile experience is immediately disqualifying.

**Independent Test**: Test every page at 320px, 375px, 768px, 1024px, 1440px, and 1920px viewports. Verify no overflow, all interactions work, and all content is accessible.

**Acceptance Scenarios**:

1. **Given** mobile viewport (320px–767px), **When** viewing any page, **Then** single-column layout, hamburger nav, touch-friendly targets (≥44px), readable text (≥16px base), no horizontal scroll
2. **Given** tablet viewport (768px–1023px), **When** viewing the projects page, **Then** 2-column project grid, nav links visible (no hamburger), filter pills wrap naturally
3. **Given** desktop viewport (1024px–1440px), **When** viewing the home page, **Then** 3-column featured projects, full nav bar, 3D hero canvas fills the viewport, metrics grid displays in a row
4. **Given** ultrawide viewport (1441px+), **When** viewing any page, **Then** max-width container (1200px) centers content, background effects extend full-width, no stretched layouts
5. **Given** any mobile viewport, **When** user interacts with the command palette, **Then** it renders as a full-screen modal with touch-optimized controls

---

### User Story 5 — Interactive 3D Hero & Animated Backgrounds (Priority: P1)

The Home page features an immersive 3D hero section using Three.js (or React Three Fiber) with an interactive particle sphere that responds to mouse movement and device orientation. An animated gradient background provides ambient visual depth across pages. The 3D scene adapts performance quality based on device capability (GPU tier detection). Animations respect `prefers-reduced-motion`.

**Why this priority**: The hero section is the first element a visitor sees. Visual impact in the first 3 seconds determines whether they explore further.

**Independent Test**: Load the Home page on desktop (with GPU) and mobile (without dedicated GPU). Verify the 3D hero renders, responds to interaction, and degrades gracefully on low-end devices without blocking page interactivity.

**Acceptance Scenarios**:

1. **Given** the Home page loads on a capable device, **When** the hero canvas initializes, **Then** 1500+ particles form an interactive sphere with mouse-reactive rotation and subtle auto-spin, matching the theme color palette
2. **Given** the Home page loads on a low-end device, **When** GPU tier is detected as low, **Then** particle count reduces to 500, animation complexity decreases, fallback gradient replaces 3D if WebGL unavailable
3. **Given** any page, **When** rendered, **Then** an animated gradient background subtly shifts between theme accent colors (teal, gold) at 0.02Hz with smooth CSS transitions
4. **Given** `prefers-reduced-motion: reduce`, **When** any page loads, **Then** all particle animations, gradient animations, and scroll-triggered animations are disabled; static fallback visuals are shown
5. **Given** theme toggle is activated, **When** the 3D hero is running, **Then** particle colors smoothly transition to match the new theme palette within 500ms

---

### User Story 6 — Dynamic Theme Customization (Priority: P2)

Beyond the existing dark/light toggle, users can customize the accent color palette. A theme customization panel (accessible via settings icon or command palette) offers preset accent palettes (Teal/Gold default, Ocean Blue, Emerald Green, Warm Amber, Monochrome) that dynamically update CSS custom properties across the entire site. Theme preference persists in localStorage.

**Why this priority**: Personalization increases engagement and demonstrates frontend craftsmanship beyond a simple toggle.

**Independent Test**: Open the theme customizer. Select each preset palette. Verify all components (buttons, links, cards, charts, gradient backgrounds) update to the new palette. Refresh the page — verify the palette persists.

**Acceptance Scenarios**:

1. **Given** the theme customizer is opened, **When** a preset palette is selected, **Then** all CSS custom properties (`--accent-primary`, `--accent-secondary`, `--metric-color`, `--gradient-*`) update in real-time across all visible components
2. **Given** a custom palette is applied, **When** the user navigates to another page, **Then** the palette persists via localStorage and applies on page load before first paint (no flash of default theme)
3. **Given** any palette, **When** WCAG contrast is checked, **Then** all text-on-background combinations maintain ≥ 4.5:1 contrast ratio (palette presets are pre-validated for AA compliance)
4. **Given** the command palette (Ctrl+K), **When** user types "theme" or "color", **Then** theme customization actions appear in results

---

### User Story 7 — AI-Powered Content Suggestions (Priority: P2)

The portfolio uses client-side behavioral signals (pages visited, sections scrolled, time spent, categories explored) to intelligently suggest relevant projects, case studies, or blog articles. An "AI Suggestions" section appears contextually — on the home page after scrolling past featured projects, on blog pages as "You might also like", and on case study pages as "Related work". No external API calls — all logic runs on-device using lightweight heuristics and content similarity scoring.

**Why this priority**: Intelligent content surfacing increases session depth and demonstrates data-driven product thinking — a core portfolio theme.

**Independent Test**: Visit the home page, click on a Data category project, read the case study, return to home. Verify the suggestions section now prioritizes Data-related content. Clear localStorage — verify suggestions reset to default (featured/trending).

**Acceptance Scenarios**:

1. **Given** a first-time visitor on the Home page, **When** the suggestions section renders, **Then** it shows the 3 featured projects (default cold-start behavior)
2. **Given** the user has visited 2 Data-category case studies, **When** they navigate to the blog page, **Then** "Recommended for you" shows data-related blog articles with higher ranking
3. **Given** the user is reading a case study, **When** they reach the bottom, **Then** "Related work" suggests the 2 most content-similar case studies/articles based on category overlap + tag similarity
4. **Given** the user has browsed for > 3 minutes, **When** they visit any page with unviewed content, **Then** a subtle "Explore more" nudge highlights unvisited sections
5. **Given** the user clears their browser data, **When** they revisit, **Then** suggestions revert to default (no server-side tracking, all data in localStorage)

---

### User Story 8 — Data-Driven Testimonials (Priority: P2)

The testimonial section on the Home page is enhanced with quantifiable results tied to each testimonial. Each testimonial card displays the recommender's name, role, company, relationship context, a quote, AND a data metric linked to the project they collaborated on (e.g., "Worked together on Churn Analysis → 15% reduction in churn rate"). Testimonials link to the relevant case study for full context.

**Why this priority**: Data-backed testimonials are significantly more credible than generic praise. They bridge social proof with demonstrated impact.

**Independent Test**: View the testimonial carousel. Verify each card shows a metric, the metric matches the linked case study's outcome section, and clicking the testimonial navigates to the correct case study.

**Acceptance Scenarios**:

1. **Given** the testimonial carousel loads, **When** each card renders, **Then** it displays: avatar/initials, name, title, company, quote, AND a highlighted metric (e.g., "Project outcome: 10× lead generation") with a subtle animated counter
2. **Given** a testimonial card, **When** the user clicks "View Case Study", **Then** they navigate to the relevant case study page
3. **Given** the carousel, **When** auto-playing, **Then** it cycles every 8 seconds, pauses on hover/focus, and is navigable via dots and swipe gestures on mobile
4. **Given** any testimonial, **When** the linked metric is cross-referenced with the case study, **Then** the numbers match exactly (single source of truth from projects data)

---

### User Story 9 — Real-Time GitHub Integration (Priority: P2)

The portfolio automatically syncs with Dhruv's GitHub profile to display real-time data: recent repositories, contribution graph/heatmap, commit activity, and pinned repos. The Projects page shows a GitHub activity section. The About page displays contribution stats. Data is fetched at build time (ISR — Incremental Static Regeneration) with a revalidation interval, ensuring content stays fresh without manual updates.

**Why this priority**: Real-time integration demonstrates technical capability and keeps the portfolio evergreen without manual maintenance.

**Independent Test**: Push a new commit to a GitHub repo. Wait for ISR revalidation. Verify the portfolio reflects the new activity within the revalidation window. Verify the page still loads if the GitHub API is unreachable (graceful fallback to last cached data).

**Acceptance Scenarios**:

1. **Given** the Projects page, **When** the GitHub section renders, **Then** it shows: pinned repos (name, description, language, stars, forks), contribution heatmap (last 365 days), and total commit count for the year
2. **Given** a new public repo is created on GitHub, **When** the ISR revalidation triggers (every 1 hour), **Then** the next visitor sees the updated repo list without a manual redeploy
3. **Given** the GitHub API is rate-limited or unreachable, **When** the page is requested, **Then** the last successfully fetched data is served from cache with a subtle "Last updated: [timestamp]" indicator
4. **Given** a pinned repo matches an existing project/case study, **When** rendered, **Then** a "View Case Study" link appears on that repo card, connecting GitHub data to portfolio content
5. **Given** the About page, **When** the stats section renders, **Then** it shows total public repos, total contributions this year, most-used languages (top 5), and longest streak

---

### User Story 10 — AR/VR Project Exploration (Priority: P3)

Select case study pages offer an immersive AR/VR exploration mode. Users can view project architecture diagrams, data flow visualizations, or UI mockups in a 3D spatial environment. On mobile, AR mode uses the device camera to place project artifacts in the real world. On desktop, a WebXR-compatible VR mode allows spatial navigation through project components. This is progressive — it enhances the case study but all content is fully accessible without AR/VR.

**Why this priority**: While innovative, AR/VR is a showcase feature rather than a core navigation requirement. It demonstrates cutting-edge frontend capability but must not block core content access.

**Independent Test**: Open a case study with AR/VR content on a WebXR-compatible device. Verify the 3D scene loads, is interactive, and can be dismissed to return to normal reading. On a non-compatible device, verify the fallback (static diagram or image) renders correctly.

**Acceptance Scenarios**:

1. **Given** a case study page with AR/VR content, **When** the user clicks "Explore in 3D", **Then** a WebXR session initializes showing the project architecture as an interactive 3D model (nodes, connections, data flows)
2. **Given** a mobile device with ARCore/ARKit, **When** "View in AR" is tapped, **Then** the project diagram is placed in the user's real-world environment via their camera
3. **Given** a device without WebXR support, **When** the case study loads, **Then** the "Explore in 3D" button is hidden and the standard Mermaid.js diagram displays instead
4. **Given** the AR/VR mode is active, **When** the user clicks "Exit", **Then** the session closes cleanly and the user returns to the standard case study page at their previous scroll position

---

### User Story 11 — Blog & Article Platform (Priority: P1)

The blog listing page and 3 article pages are migrated to React components with enhanced functionality: MDX support for rich article authoring (embed React components within content), full-text search with highlighted matches, category and tag filtering, estimated reading time, and social sharing. Article pages feature a sticky table of contents, reading progress bar, code syntax highlighting, and related articles.

**Why this priority**: Blog content establishes thought leadership and drives organic SEO traffic.

**Independent Test**: Create a new MDX article file. Verify it appears on the blog listing, has correct metadata, renders with proper formatting, and the search/filter system includes it.

**Acceptance Scenarios**:

1. **Given** the blog listing page, **When** rendered, **Then** all articles display with title, excerpt, date, category tag, reading time, and a thumbnail
2. **Given** the search input, **When** user types a query, **Then** articles filter in real-time (≤200ms) with matched terms highlighted in the results
3. **Given** an article page, **When** the user scrolls, **Then** the reading progress bar fills proportionally, and the sticky TOC sidebar highlights the current section
4. **Given** an MDX article, **When** it includes a React component (e.g., interactive chart, live code demo), **Then** the component renders interactively within the article flow
5. **Given** an article page, **When** a share button is clicked, **Then** the native share API (if available) or fallback copy-to-clipboard is invoked with the article URL and title

---

### User Story 12 — Contact & Outreach (Priority: P2)

The contact page features a form with client-side validation, FAQ accordion, availability status, and direct links. The form submits to a Next.js API route with Resend for actual email delivery instead of just mailto: construction.

**Why this priority**: A functional contact form that actually delivers messages is critical for converting portfolio visits into opportunities.

**Independent Test**: Submit the contact form with valid data. Verify the email is delivered. Submit with invalid data — verify validation messages appear.

**Acceptance Scenarios**:

1. **Given** the contact form, **When** submitted with valid data (name, email, message ≥20 chars), **Then** the form data is sent to a Next.js API route (`/api/contact`) via Resend SDK, a success toast appears, and the form resets
2. **Given** the contact form, **When** submitted with invalid data, **Then** inline validation errors appear (name required, email format invalid, message too short) without page reload
3. **Given** the API route is unreachable, **When** form is submitted, **Then** a fallback mailto: link is offered with pre-filled subject and body
4. **Given** the form submission endpoint, **When** receiving data, **Then** it validates server-side (sanitize inputs, verify email format, rate-limit to 5 submissions per IP per hour) to prevent abuse

---

### User Story 13 — Performance & Core Web Vitals (Priority: P1)

The Next.js application achieves Lighthouse > 95 on all four categories (Performance, Accessibility, Best Practices, SEO) across all pages. Core Web Vitals meet: FCP < 1.8s, LCP < 2.0s, FID < 100ms, CLS < 0.05. Images are optimized via Next.js `<Image>` component. Code splitting ensures only the JavaScript needed for each page is loaded. Fonts are self-hosted or preloaded.

**Why this priority**: Performance is a non-negotiable quality gate and directly impacts search ranking.

**Independent Test**: Run Lighthouse CI in the deployment pipeline on all 14 routes. Every route must pass the > 95 threshold on all four categories.

**Acceptance Scenarios**:

1. **Given** any page, **When** Lighthouse audit runs, **Then** Performance > 95, Accessibility > 95, Best Practices > 95, SEO > 95
2. **Given** the Home page with 3D hero, **When** loaded on a 4G connection, **Then** FCP < 1.8s, LCP < 2.0s (hero text renders as LCP, not the 3D canvas), FID < 100ms, CLS < 0.05
3. **Given** any page, **When** the JavaScript bundle is analyzed, **Then** only the JS for that page + shared layout is loaded (per-page code splitting), total JS per page < 150KB gzipped
4. **Given** the app uses fonts (Satoshi, Boska), **When** they load, **Then** they are self-hosted in /public/fonts with `font-display: swap` and preloaded in `<Head>` to avoid FOIT
5. **Given** `next/image` is used, **When** images appear on screen, **Then** they are lazy-loaded, served in WebP/AVIF format, and sized appropriately for the viewport

---

### Edge Cases

- What happens when Three.js/WebGL fails to initialize? → Fallback to animated CSS gradient hero with typed text.
- What happens when GitHub API rate limit is exceeded? → Serve last cached data with "Last updated" timestamp. Never show an error state.
- What happens when a user navigates faster than page transitions complete? → Cancel in-flight transition, navigate immediately to the latest target.
- What happens when localStorage is full or disabled? → All features degrade gracefully: theme defaults to system preference, suggestions show defaults, no crash.
- What happens when a case study slug doesn't match a data file? → Return Next.js custom 404 page.
- What happens on extremely slow connections (2G)? → Critical CSS is inlined, hero text is visible without JS, 3D canvas loads last with `loading="lazy"` behavior.
- What happens when the AR/VR hardware is disconnected mid-session? → WebXR session ends gracefully, user returns to standard view.
- What happens when a blog article MDX file has a syntax error? → Build fails with a clear error message pointing to the offending file and line.

---

## Requirements

### Functional Requirements

#### Core Architecture (Next.js Migration)

- **FR-001**: Application MUST be built with Next.js App Router (`app/` directory) with React 18+ and React Server Components
- **FR-002**: All 14 existing pages MUST be converted to Next.js routes with file-based routing: `/`, `/about`, `/projects`, `/projects/[slug]` (case studies), `/blog`, `/blog/[slug]` (articles), `/contact`, `/now`, and custom `/404`
- **FR-003**: Shared layout (navigation, footer, custom cursor, command palette, toast system) MUST be implemented as a persistent layout component that does not remount on navigation
- **FR-004**: Pages MUST use Static Site Generation (SSG) with `generateStaticParams()` and async server components for case studies and blog articles generated from data files
- **FR-005**: System MUST support Incremental Static Regeneration (ISR) for pages consuming external API data (GitHub integration) with configurable revalidation intervals
- **FR-006**: All existing design tokens from `tokens.css` MUST be preserved as global CSS and extended using CSS custom properties; all component styles MUST use CSS Modules (`.module.css`) for scoped class names
- **FR-007**: Page transitions between routes MUST use Framer Motion (preferred for App Router compatibility) with shared layout animations, achieving <200ms perceived navigation time

#### SEO & Metadata

- **FR-008**: Every page MUST have unique, dynamic `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`, `og:url`), and Twitter Card tags
- **FR-009**: JSON-LD structured data MUST be injected on every page: `Person` + `WebSite` (home), `Article` (blog), `CreativeWork` (case studies), `BreadcrumbList` (all inner pages), `FAQPage` (contact)
- **FR-010**: System MUST auto-generate `/sitemap.xml` with all routes, correct `lastmod` dates, and priority values using `next-sitemap` or equivalent
- **FR-011**: System MUST serve a `/robots.txt` allowing all crawlers and referencing the sitemap
- **FR-012**: All internal links MUST use semantic `<a>` tags wrapped in Next.js `<Link>` for client-side navigation while preserving crawlability
- **FR-013**: Social preview images (1200×630) MUST be generated for each page type using `next/og` or a build-time image generation pipeline
- **FR-014**: Canonical URLs MUST be set on every page to prevent duplicate content issues

#### Responsive Design

- **FR-015**: System MUST implement responsive layouts using mobile-first CSS with breakpoints at 320px, 768px, 1024px, and 1440px
- **FR-016**: All interactive elements (buttons, links, form inputs, toggles) MUST have a minimum touch target of 44×44px on mobile
- **FR-017**: Navigation MUST adapt: hamburger menu on mobile (<768px), full nav bar on tablet+, with smooth transition between states
- **FR-018**: Typography MUST scale fluidly using CSS `clamp()` for headings and body text across all viewports
- **FR-019**: Images and media MUST be responsive using `next/image` with `sizes` attribute for art direction and viewport-appropriate sizing
- **FR-020**: The project grid MUST reflow: 1 column on mobile, 2 columns on tablet, 3 columns on desktop

#### Interactive Features

- **FR-021**: Home page MUST render a Three.js / React Three Fiber 3D particle sphere (1500 particles on high-end, 500 on low-end) with mouse/touch interaction and theme-reactive colors
- **FR-022**: System MUST detect GPU capability (via `navigator.gpu` or `WEBGL_debug_renderer_info`) and adapt 3D complexity accordingly (high/medium/low/fallback tiers)
- **FR-023**: System MUST render animated gradient backgrounds on all pages using CSS animations or canvas, shifting between theme accent colors at low frequency (≤0.05Hz)
- **FR-024**: Theme customization panel MUST offer ≥5 preset accent palettes, all pre-validated for WCAG AA contrast
- **FR-025**: Theme customizer MUST be accessible via a settings icon in the nav and through the command palette
- **FR-026**: AR/VR project exploration MUST be implemented using WebXR API for compatible case study pages, with progressive enhancement (hidden on unsupported devices)
- **FR-027**: Custom cursor MUST follow mouse with dot + ring design, magnetic hover effects on interactive elements, and be hidden on touch devices
- **FR-028**: Command palette (Ctrl+K / Cmd+K) MUST include all navigation targets (14 pages + case studies + articles), theme actions, and search across all content

#### AI-Powered Suggestions

- **FR-029**: System MUST track user behavioral signals client-side (pages visited, scroll depth per section, time on page, categories interacted with) in localStorage
- **FR-030**: Content suggestion engine MUST compute relevance scores for all projects, case studies, and articles based on: category affinity (weighted by recency), content tag overlap, and unvisited-content boost
- **FR-031**: "Recommended for you" section MUST appear on Home (below featured projects), Blog listing (top), and Case Study pages (bottom as "Related Work")
- **FR-032**: Cold-start behavior (no browsing history) MUST default to displaying featured/most-recent content
- **FR-033**: All suggestion logic MUST run client-side only — no external API calls, no server-side tracking, no cookies; all data stored in localStorage

#### Data-Driven Testimonials

- **FR-034**: Each testimonial card MUST display: recommender name, title, company, relationship context, quote, AND a highlighted project-outcome metric linked to a specific case study
- **FR-035**: Testimonial metrics MUST be sourced from the same data file as case study outcomes (single source of truth)
- **FR-036**: Each testimonial MUST link to its associated case study page
- **FR-037**: Testimonial carousel MUST support auto-play (8s), pause on hover/focus, dot navigation, and swipe gestures on mobile

#### Real-Time Updates (GitHub Integration)

- **FR-038**: System MUST fetch GitHub profile data (pinned repos, contribution graph, commit activity, language stats) via GitHub GraphQL API at build time with ISR
- **FR-039**: Projects page MUST display a "GitHub Activity" section with pinned repos (name, description, language badge, stars, forks) and contribution heatmap
- **FR-040**: About page MUST display GitHub contribution stats (total repos, total contributions, top languages, current streak)
- **FR-041**: GitHub repos matching existing portfolio projects MUST display a "View Case Study" link
- **FR-042**: System MUST handle API failures gracefully: serve stale cached data with "Last updated" timestamp, never show error states to users
- **FR-043**: ISR revalidation interval for GitHub data MUST be configurable (default: 3600 seconds / 1 hour)

#### Blog & Content Platform

- **FR-044**: Blog articles MUST support MDX format for embedding React components (interactive charts, live demos, callout boxes) within markdown content
- **FR-045**: Blog listing MUST support full-text search with highlighted matches and category/tag filtering with URL parameter persistence
- **FR-046**: Article pages MUST feature: reading progress bar, auto-generated sticky TOC from headings, social share buttons, estimated reading time, and "Related articles" section
- **FR-047**: Code blocks in articles MUST use syntax highlighting (Prism.js or Shiki) with copy-to-clipboard button

#### Contact & Forms

- **FR-048**: Contact form MUST submit to a Next.js API route (`app/api/contact/route.ts`) that sends email via Resend SDK (`RESEND_API_KEY` env var), delivering form submissions as formatted emails
- **FR-049**: Form MUST validate client-side (name required, email regex, message ≥20 chars) with inline error messages and server-side (input sanitization, rate limiting: 5 per IP per hour via Vercel Edge middleware or in-memory store)
- **FR-050**: FAQ accordion MUST be keyboard navigable (Enter/Space to toggle, Arrow keys between items) with ARIA `role="region"` and `aria-expanded`

#### Accessibility & Performance

- **FR-051**: System MUST achieve WCAG 2.1 AA compliance: color contrast ≥4.5:1, keyboard navigable, skip links, ARIA landmarks, form labels, focus indicators
- **FR-052**: All animations MUST respect `prefers-reduced-motion: reduce` — disable all motion, show static alternatives
- **FR-053**: System MUST implement per-page code splitting; total JS per page MUST be < 150KB gzipped (excluding async-loaded Three.js on Home page)
- **FR-054**: Fonts (Satoshi, Boska, JetBrains Mono) MUST be self-hosted with `font-display: swap` and `<link rel="preload">`
- **FR-055**: System MUST be print-friendly: hide nav, footer, cursor, 3D canvas; show content in readable layout
- **FR-056**: System MUST integrate Vercel Analytics and Web Vitals for real-user Core Web Vitals monitoring (LCP, FID, CLS, TTFB) and page view tracking — zero cookies, GDPR-friendly, no consent banner required

### Key Entities

- **Page**: Route path, title, description, OG image, layout type (hub/deep-dive/listing/article), data-page attribute equivalent, associated components
- **Project**: Slug, name, category (Product/Data/AI/Technical), description, stack tags, metric value, metric label, featured flag, case study link, GitHub repo URL
- **CaseStudy**: Slug, title, subtitle, role, duration, stack, TL;DR, sections (context, research, solution, implementation, outcome, learnings), metrics, charts config, prev/next links
- **BlogArticle**: Slug, title, date, category, tags, reading time, excerpt, MDX content, related articles, social image
- **Testimonial**: Name, title, company, quote, avatar, project reference (slug), outcome metric (value + label), case study link
- **GitHubProfile**: Username, pinned repos[], contribution heatmap data, total contributions, top languages[], streak
- **UserBehavior** (localStorage): Pages visited[], section scroll depths{}, category affinities{}, timestamps, session count
- **ThemeConfig**: Mode (dark/light), accent palette name, custom property overrides{}

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Lighthouse scores > 95 on all four categories (Performance, Accessibility, Best Practices, SEO) across all 14 routes, measured in CI pipeline
- **SC-002**: Core Web Vitals: LCP < 2.0s, FID < 100ms, CLS < 0.05 on all pages (stricter than industry "good" thresholds)
- **SC-003**: Client-side route navigation completes in < 200ms (measured from click to content visible) for all internal links
- **SC-004**: Build time for full SSG of all 14 pages + ISR setup completes in < 60 seconds
- **SC-005**: Total JavaScript bundle per page < 150KB gzipped (excluding Three.js on home page which loads async)
- **SC-006**: 100% of pages pass WCAG 2.1 AA automated checks (axe-core or Lighthouse accessibility audit)
- **SC-007**: All 14 pages return valid HTML (W3C validator), valid structured data (Google Rich Results Test), and correct Open Graph previews
- **SC-008**: GitHub data refreshes automatically within ISR revalidation window (default 1 hour) without manual intervention
- **SC-009**: AI suggestion relevance: after visiting 2+ pages in the same category, recommended content prioritizes that category (verifiable via localStorage inspection)
- **SC-010**: Contact form successfully delivers messages to the configured email endpoint with < 3 second response time
- **SC-011**: Zero console errors, zero broken internal links across all 14 routes (automated link check in CI)
- **SC-012**: 3D hero scene initializes within 2 seconds on devices with dedicated GPU and falls back gracefully within 1 second on devices without WebGL

---

## Clarifications

### Session 2026-03-31

- Q: Next.js App Router vs Pages Router? → A: App Router (`app/` directory) — modern default with native layouts, React Server Components, streaming SSR, `generateStaticParams()`, and `metadata` export API.
- Q: CSS styling strategy (CSS Modules vs Tailwind vs CSS-in-JS)? → A: CSS Modules (`.module.css`) — zero-config in Next.js, zero runtime JS, scoped classes, SSR-compatible. Existing `tokens.css` imported as global CSS.
- Q: Deployment platform (Vercel vs GitHub Pages vs Netlify)? → A: Vercel — full Next.js feature support (ISR, API routes, edge functions, `next/og`). Free tier covers portfolio traffic.
- Q: Analytics & observability strategy? → A: Vercel Analytics + Web Vitals — zero-config, real-user Core Web Vitals monitoring, page views. No cookies, GDPR-friendly.
- Q: Contact form email delivery service? → A: Resend — developer-first email API, 100 emails/day free, simple SDK, high deliverability, built-in rate limiting, React Email templates.

---

## Assumptions

- The target deployment platform is Vercel with full Next.js feature support (ISR, API routes, edge functions, `next/og` image generation). Free tier is sufficient for portfolio traffic levels
- The existing 14-page information architecture (routes, content hierarchy) is preserved; this is a technology migration, not a content redesign
- Three.js / React Three Fiber will be used for 3D graphics; Framer Motion for page transitions and animations (replacing CDN-loaded GSAP with npm packages)
- GitHub integration uses the authenticated GitHub GraphQL API with a personal access token stored as an environment variable (`GITHUB_TOKEN`)
- AI-powered suggestions are entirely client-side heuristics (no LLM, no external AI API calls) — "AI" refers to intelligent content scoring algorithms
- AR/VR (WebXR) is a progressive enhancement feature limited to case study pages with pre-built 3D assets; it will not be available on all case studies at launch
- Blog articles will transition from static HTML to MDX files in a `content/blog/` directory, parsed at build time
- Contact form backend uses Next.js API routes with Resend SDK for email delivery (100 emails/day free tier, built-in rate limiting)
- Analytics uses Vercel Analytics + Web Vitals for real-user performance monitoring and page view tracking (zero-config, no cookies, GDPR-friendly)
- All content (text, testimonials, project data) remains in local JSON/MDX files — no external CMS at this stage
- The existing design language (glassmorphism, teal/gold palette, Satoshi/Boska typography) is carried forward; the migration improves implementation, not aesthetics
- Dribbble integration is deferred to a future iteration; GitHub is the priority real-time integration source
- The developer (Dhruv) has Node.js 18+ and npm/pnpm available in the development environment
