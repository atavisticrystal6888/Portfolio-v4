# Implementation Plan: Dhruv Singhal Portfolio v3 — Multi-Page Architecture

**Date**: 2026-03-31 | **Version**: 3.0 | **Spec**: specs/portfolio-v2/spec.md  
**Architecture**: Multi-page static website with shared layout system  
**Previous Version**: v2 (single-page, single index.html with 6 CSS + 12 JS files)

---

## Executive Summary

Evolve from a single-page portfolio into a **multi-page website** with dedicated pages for case studies, a blog/thoughts section, an about/resume page, and interactive tools. Inspired by best-in-class PM portfolios (odena.io's product-focused depth, Lenny Rachitsky's content-driven authority, Jackie Bavaro's case-study-first structure, and top developer portfolios with immersive 3D experiences).

The goal: a visitor should be able to spend **15+ minutes** on this site — reading case studies, exploring interactive dashboards, reading thought pieces — not just skim a single scroll.

---

## Research & Inspiration Analysis

### Reference: odena.io (Product/Developer Platform)
- **Multi-page architecture**: Separate pages for product, team, docs, blog
- **Case study depth**: Each project gets a dedicated page with problem framing, process documentation, metrics, screenshots, and learnings
- **Developer community focus**: Content that demonstrates expertise, not just lists it
- **Clean navigation**: Persistent nav that adapts per page, breadcrumbs on inner pages
- **Interactive elements**: Embedded demos, code snippets, live metrics dashboards

### Reference: Top PM Portfolio Patterns
- **Jackie Bavaro** (pmbavaro.com): Case studies with structured STAR format, separate pages per project, downloadable resume
- **Lewis Lin** (lewislin.com): Thought leadership blog integrated into portfolio, newsletter signup
- **Lenny Rachitsky**: Content-first with categories, search, and tagging
- **Stripe.com/Atlas**: Clean multi-page with each product case study as its own page, beautiful type hierarchy
- **Linear.app**: Changelog/updates page, computed metrics, minimalist design with depth

### Reference: Top Developer Portfolio Patterns  
- **Brittany Chiang** (brittanychiang.com): Multi-section with project deep-dives as separate pages
- **Vivek Patel** (vivek9patel.github.io): Interactive OS-style portfolio with multiple "apps"
- **albinotonnina.com**: Interactive animations with scene management

### Synthesized Feature Set for Multi-Page
| Feature | Inspiration Source | Priority |
|---------|-------------------|----------|
| Dedicated case study pages per project | odena.io, Jackie Bavaro | P1 |
| Blog/thoughts section with individual articles | Lenny, Lewis Lin, odena.io | P1 |
| About/resume page with downloadable PDF | Jackie Bavaro, devportfolios | P1 |
| Interactive skills dashboard (not just a list) | vivek9patel, Linear | P2 |
| Project metrics & outcome visualization | Stripe Atlas, odena.io | P2 |
| Changelog/now page (what I'm doing currently) | Linear, Derek Sivers (/now) | P2 |
| Reading list / resource curation | Lenny, Lewis Lin | P3 |
| Contact page with form + availability | Standard PM portfolios | P2 |
| 404 page with personality | Best practice | P3 |

---

## Technical Context

**Language/Version**: HTML5, CSS3, ES6+ JavaScript (IIFE pattern)  
**Primary Dependencies (CDN)**:
| Library | Version | Purpose | CDN Size (gz) |
|---------|---------|---------|---------------|
| Three.js | r128 | 3D WebGL particle mesh (home hero) | ~150KB |
| GSAP | 3.12.5 + ScrollTrigger | Scroll-driven animations (all pages) | ~95KB |
| Chart.js | 4.4.0 | Skills radar + project metric charts | ~65KB |
| tsParticles | 2.12.0 | Ambient particle background (home) | ~80KB |
| Typed.js | 2.1.0 | Hero role typing animation (home) | ~5KB |
| Lucide Icons | latest | Icon system (all pages) | ~25KB |
| Fontshare | — | Satoshi (body) + Boska (display) | ~40KB |
| Prism.js | 1.29 | Code syntax highlighting (blog, case studies) | ~20KB |
| Mermaid.js | 10.x | Diagram rendering (case studies, select blog articles) | ~50KB |

**Storage**: localStorage (theme, command palette recents, reading progress)  
**Testing**: Manual browser + Lighthouse + axe DevTools  
**Target Browsers**: Chrome 90+, Firefox 88+, Safari 15+, Edge 90+  
**Performance Goals**: FCP < 1.8s, LCP < 2.5s, CLS < 0.1, Lighthouse > 90  
**Constraints**: No npm, no bundler, CDN-only, works with file:// protocol, GitHub Pages deployable  

---

## Architecture — Multi-Page File Map

```
portfolio/
├── index.html                      # Home — hero + overview sections (landing page)
├── about.html                      # About — full bio, resume, education, philosophy
├── projects.html                   # Projects — grid of all projects with filters
├── case-studies/
│   ├── aarkid.html                 # Case Study — Aarkid Flora Monitoring
│   ├── churn-analysis.html         # Case Study — Customer Churn Analysis
│   ├── marketing-effectiveness.html # Case Study — Marketing Campaign Analysis
│   └── portfolio-site.html         # Case Study — This portfolio (meta)
├── blog.html                       # Blog — article listing with categories
├── blog/
│   ├── why-pms-should-code.html          # Article page
│   ├── data-driven-product-decisions.html # Article page
│   └── structured-thinking-framework.html # Article page
├── contact.html                    # Contact — form, availability, social
├── now.html                        # Now — what I'm currently doing (/now page)
├── 404.html                        # 404 page with personality
│
├── css/
│   ├── tokens.css                  # Design tokens (dark/light themes) — SHARED
│   ├── base.css                    # Reset, typography, layout — SHARED
│   ├── components.css              # Nav, footer, buttons, cards, badges — SHARED
│   ├── home.css                    # Home page specific (hero, metrics bar, overview)
│   ├── about.css                   # About page specific (timeline, resume, philosophy)
│   ├── projects.css                # Projects listing (grid, filters, cards)
│   ├── case-study.css              # Case study template (metrics viz, process flow, screenshots)
│   ├── blog.css                    # Blog listing + article pages (typography, code blocks)
│   ├── contact.css                 # Contact page specific
│   ├── animations.css              # @keyframes, GSAP hooks, transitions — SHARED
│   └── responsive.css              # All @media queries — SHARED
│
├── js/
│   ├── app.js                      # Global orchestrator (nav, theme, footer) — ALL PAGES
│   ├── theme.js                    # Dark/light toggle — ALL PAGES
│   ├── cursor.js                   # Custom cursor — ALL PAGES
│   ├── toast.js                    # Toast notifications — ALL PAGES
│   ├── command-palette.js          # Ctrl+K navigation — ALL PAGES
│   ├── scroll-animations.js        # GSAP ScrollTrigger — ALL PAGES
│   ├── three-hero.js               # Three.js particles — HOME ONLY
│   ├── particles-bg.js             # tsParticles ambient — HOME ONLY
│   ├── utils.js                    # Counters, clipboard, typed — HOME + CASE STUDY
│   ├── skills-chart.js             # Chart.js radar — ABOUT ONLY
│   ├── carousel.js                 # Testimonial carousel — HOME ONLY
│   ├── project-filters.js          # Project grid filtering — PROJECTS ONLY
│   ├── case-study-charts.js        # Metric visualizations — CASE STUDY ONLY
│   ├── blog-search.js              # Blog search + category filter — BLOG ONLY
│   ├── reading-progress.js         # Article reading progress bar — BLOG ARTICLE ONLY
│   ├── contact-form.js             # Form validation + submission — CONTACT ONLY
│   └── page-transitions.js         # Smooth page transitions — ALL PAGES
│
└── assets/
    ├── images/
    │   ├── og-home.png             # Open Graph image for home
    │   ├── og-about.png            # Open Graph image for about
    │   └── projects/               # Project screenshots/diagrams
    ├── resume/
    │   └── dhruv-singhal-resume.pdf
    └── data/
        ├── projects.json           # Project data (name, stack, metrics, slug)
        └── blog-posts.json         # Blog metadata (title, date, tags, slug)
```

---

## Page Architecture & Content Strategy

### Page 1: Home (index.html) — "The Hook"
**Purpose**: 3-second impression → 30-second exploration → click to a deep page  
**Content**:
- 3D particle hero with typed roles + key CTA
- Metrics bar (5 headline numbers)
- Featured projects (top 3 cards → link to case studies)
- Brief about teaser (2 sentences → link to about page)
- Testimonial carousel (3 quotes)
- Blog teaser (latest 3 article cards → link to blog)
- Contact CTA strip

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, three-hero, particles-bg, utils, carousel

### Page 2: About (about.html) — "The Full Story"
**Purpose**: Recruiter deep-dive into background, philosophy, and skills  
**Content**:
- Hero banner with name, title, brief statement
- Product philosophy section ("How I Think About Product")
- Full bio with narrative (expanded from home)
- Skills dashboard with interactive radar chart + skill category cards
- Experience timeline (full detail, expanded bullets)
- Education section
- Achievements & recognition grid
- Downloadable resume CTA
- Traits/values section with visual cards

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, skills-chart, utils

### Page 3: Projects (projects.html) — "The Proof"
**Purpose**: Browsable grid of all projects with filtering  
**Content**:
- Page header with project count
- Filter bar (All / Product / Data / Technical / AI)
- Project cards in a grid (animated entry)
  - Each card: name, stack chips, 1-line outcome, metric badge, "Read Case Study →" link
- Sort options (newest, biggest impact)

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, project-filters

### Pages 4-7: Case Studies (case-studies/*.html) — "The Depth"
**Purpose**: Deep-dive into each project — this is where PM skills are proven  
**Template structure** (same layout per case study):
1. Hero banner with project name, role, timeline, stack
2. TL;DR / Executive Summary box
3. Context & Problem Statement (with metric: "before state")
4. Research & Discovery process
5. Solution & Approach (with diagrams via Mermaid.js)
6. Implementation Details (with code snippets via Prism.js where relevant)
7. Outcome & Metrics (interactive Chart.js visualizations: before→after, growth curves)
8. Learnings & Reflections
9. Navigation: ← Previous Case Study | Next Case Study →
10. Related blog posts

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, case-study-charts, utils, reading-progress

### Page 8: Blog (blog.html) — "The Authority"
**Purpose**: Thought leadership — proves PM thinking beyond just shipping  
**Content**:
- Page header ("Thoughts on Product, Data & Building")
- Category pills (All / Product / Data / Career / Technical)
- Search input with fuzzy match
- Article cards in grid (title, date, reading time, category tag, excerpt)
- Initial articles:
  1. "Why PMs Should Learn to Code (And When to Stop)"
  2. "Data-Driven Doesn't Mean Dashboard-Driven"
  3. "A Structured Thinking Framework for Ambiguous Problems"

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, blog-search

### Pages 9-11: Blog Articles (blog/*.html) — "The Content"
**Template structure**:
1. Article header (title, date, reading time, category, author)
2. Reading progress bar at top
3. Table of contents sidebar (auto-generated from headings)
4. Article body with rich typography (blockquotes, code blocks, callouts)
5. Author card at bottom
6. Navigation: ← Previous Article | Next Article →
7. Related articles suggestions

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, reading-progress

### Page 12: Contact (contact.html) — "The Handshake"
**Purpose**: Multiple ways to connect, with a form for direct outreach  
**Content**:
- Page header with availability status (green dot + "Open to Opportunities")
- Contact form (Name, Email, Subject dropdown, Message, Submit)
  - Client-side validation
  - Submission via mailto: link construction (no backend needed)
  - Success toast on submit
- Direct links card (Email copy, LinkedIn, GitHub, Twitter/X)
- Calendar scheduling link (if applicable)
- Location & timezone info
- FAQ accordion ("What roles are you looking for?", "Are you open to relocating?", etc.)

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions, contact-form

### Page 13: Now (now.html) — "The Context"
**Purpose**: a /now page showing what Dhruv is currently focused on (inspired by Derek Sivers)  
**Content**:
- Last updated date
- "Currently" sections:
  - Working on: (Wipro Aviation OS, Odena consulting)
  - Learning: (current learning focus)
  - Reading: (current books/articles)
  - Building: (side projects)
  - Looking for: (roles/opportunities)
- Minimal styling, content-focused

**JS modules loaded**: app, theme, cursor, toast, command-palette, scroll-animations, page-transitions

### Page 14: 404 (404.html) — "The Personality"
**Purpose**: Charming error page that keeps visitors engaged  
**Content**:
- Fun heading ("This page shipped to production without a spec")
- Animated illustration (CSS/SVG)
- Link back to home
- Random PM quote

**JS modules loaded**: app, theme

---

## Shared Layout System

Every page shares a common structure:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <!-- Meta, OG tags, page-specific title -->
  <!-- Shared CSS: tokens.css, base.css, components.css, animations.css, responsive.css -->
  <!-- Page-specific CSS: home.css OR about.css OR etc. -->
  <!-- CDN libs (defer) -->
  <!-- Fonts -->
</head>
<body data-page="home|about|projects|case-study|blog|article|contact|now|404">
  <!-- Skip link -->
  <!-- Custom cursor elements -->
  <!-- Scroll progress bar -->
  <!-- Toast container -->
  <!-- Command palette modal -->

  <!-- SHARED NAV (same across all pages) -->
  <header class="nav">...</header>

  <!-- PAGE CONTENT (unique per page) -->
  <main>...</main>

  <!-- SHARED FOOTER (same across all pages) -->
  <footer class="footer">...</footer>

  <!-- Shared JS: app.js, theme.js, cursor.js, toast.js, command-palette.js, scroll-animations.js -->
  <!-- Page-specific JS: loaded conditionally based on data-page -->
</body>
</html>
```

### Navigation Updates for Multi-Page
The nav must now link to actual pages instead of anchor sections:
- **Home** → `index.html`
- **About** → `about.html`
- **Projects** → `projects.html`
- **Blog** → `blog.html`
- **Contact** → `contact.html`
- Active page highlighted in nav via `data-page` attribute

### Command Palette Updates
Must now include cross-page navigation:
- "Go to Home" → navigate to index.html
- "Go to About" → navigate to about.html
- "Go to Projects" → navigate to projects.html
- "Read Case Study: Aarkid" → navigate to case-studies/aarkid.html
- "Read: Why PMs Should Code" → navigate to blog/why-pms-should-code.html
- Plus existing: theme toggle, copy email, open LinkedIn

---

## Technology Integration Map

| Technology | Purpose | Pages Used | Files Involved |
|------------|---------|------------|---------------|
| Three.js r128 | 3D particle hero | Home only | js/three-hero.js |
| GSAP 3.12.5 + ScrollTrigger | Scroll animations | All pages | js/scroll-animations.js |
| Chart.js 4.4.0 | Skills radar + case study charts | About, Case Studies | js/skills-chart.js, js/case-study-charts.js |
| tsParticles 2.12.0 | Ambient particles | Home only | js/particles-bg.js |
| Typed.js 2.1.0 | Hero typing | Home only | js/utils.js |
| Lucide Icons | Icon system | All pages | All HTML files |
| Prism.js 1.29 | Code highlighting | Blog articles, Case studies | blog/*.html, case-studies/*.html |
| Mermaid.js | 10.x | Diagrams | Case studies, Blog article (T034) | case-studies/*.html, blog/structured-thinking-framework.html |
| Fontshare | Satoshi + Boska fonts | All pages | All HTML (link tag) |

### Per-Page Script Loading Matrix

| JS File | Home | About | Projects | Case Study | Blog List | Blog Article | Contact | Now | 404 |
|---------|------|-------|----------|------------|-----------|--------------|---------|-----|-----|
| app.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| theme.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| cursor.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| toast.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| command-palette.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| scroll-animations.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| page-transitions.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| three-hero.js | ✓ | — | — | — | — | — | — | — | — |
| particles-bg.js | ✓ | — | — | — | — | — | — | — | — |
| utils.js | ✓ | ✓ | — | ✓ | — | — | — | — | — |
| carousel.js | ✓ | — | — | — | — | — | — | — | — |
| skills-chart.js | — | ✓ | — | — | — | — | — | — | — |
| project-filters.js | — | — | ✓ | — | — | — | — | — | — |
| case-study-charts.js | — | — | — | ✓ | — | — | — | — | — |
| blog-search.js | — | — | — | — | ✓ | — | — | — | — |
| reading-progress.js | — | — | — | ✓ | — | ✓ | — | — | — |
| contact-form.js | — | — | — | — | — | — | ✓ | — | — |

---

## CSS Architecture for Multi-Page

### Shared CSS (loaded on EVERY page)
1. `tokens.css` — Design tokens, theme variables
2. `base.css` — Reset, typography, layout primitives
3. `components.css` — Nav, footer, buttons, cards, badges, modals, toast, cursor, command palette, scroll progress
4. `animations.css` — Keyframes, .fade-in, GSAP hooks, reduced-motion
5. `responsive.css` — All media queries for shared components

### Page-Specific CSS (loaded only on that page)
6. `home.css` — Hero, metrics bar, featured projects grid, blog teaser, testimonials
7. `about.css` — Philosophy section, Skills dashboard, detailed timeline, achievements, resume download
8. `projects.css` — Project filter bar, project grid with hover cards
9. `case-study.css` — Case study template: hero banner, process flow, metrics visualization, navigation between case studies, TL;DR box, code blocks
10. `blog.css` — Blog listing grid, article page typography, reading progress bar, table of contents, code blocks, blockquotes, callout boxes
11. `contact.css` — Contact form, FAQ accordion, direct links card, availability status hero

---

## Data Architecture

### projects.json
```json
[
  {
    "slug": "aarkid",
    "name": "Aarkid — Flora Monitoring System",
    "category": "ai",
    "stack": ["Gemini Pro Vision", "Python", "LangChain", "FastAPI"],
    "oneLiner": "AI-powered plant care guidance using vision models",
    "metricValue": "End-to-End",
    "metricLabel": "AI Product Build",
    "featured": true
  },
  ...
]
```

### blog-posts.json
```json
[
  {
    "slug": "why-pms-should-code",
    "title": "Why PMs Should Learn to Code (And When to Stop)",
    "date": "2026-03-28",
    "category": "career",
    "readingTime": "6 min",
    "excerpt": "The line between 'technical enough' and 'doing the engineer's job' is thinner than you think.",
    "featured": true
  },
  ...
]
```

---

## Page Transition Strategy

To create a cohesive multi-page experience (not jarring full reloads):
1. **Exit animation**: On internal link click, fade out main content (200ms)
2. **Navigation**: `window.location.href = targetUrl`
3. **Entry animation**: On DOMContentLoaded, fade in main content (300ms)
4. **Persistent elements**: Nav and footer remain stable (no flash)
5. **Implementation**: `page-transitions.js` handles this via class toggling on `<main>`

---

## Implementation Phases

### Phase 1: Shared Foundation & Layout System
**Goal**: Establish the shared HTML template, updated nav, updated CSS architecture, and global JS modules that work across all pages.

**Files**: Updated `css/tokens.css`, `css/base.css`, `css/components.css`, `css/animations.css`, `css/responsive.css`, `js/app.js`, `js/theme.js`, `js/cursor.js`, `js/toast.js`, `js/command-palette.js`, `js/scroll-animations.js`, `js/page-transitions.js`

**Changes from v2**:
- Update nav to link to pages instead of anchors
- Update command palette with cross-page navigation
- Add page transition system
- Update app.js to detect `data-page` and conditionally init modules
- Footer updated with site map links

### Phase 2: Home Page (index.html)
**Goal**: Rebuild the landing page to be a hub that funnels visitors to deeper pages.

**Files**: `index.html`, `css/home.css`, `js/three-hero.js`, `js/particles-bg.js`, `js/utils.js`, `js/carousel.js`

**Changes from v2**:
- Shorter content (teasers, not full sections)
- "View All Projects →" link instead of full project grid
- "Read More About Me →" link instead of full about section
- Blog teaser section (latest 3 posts)
- Each project card links to its case study page

### Phase 3: About Page (about.html)
**Goal**: The comprehensive "who is Dhruv" page with skills dashboard.

**Files**: `about.html`, `css/about.css`, `js/skills-chart.js`, `js/utils.js`

**Content**: Full bio, product philosophy, skills radar, experience timeline (full detail), education, achievements, downloadable resume

### Phase 4: Projects & Case Studies
**Goal**: The project browsing experience and deep-dive case study pages.

**Files**: `projects.html`, `css/projects.css`, `js/project-filters.js`, `case-studies/aarkid.html`, `case-studies/churn-analysis.html`, `case-studies/marketing-effectiveness.html`, `case-studies/portfolio-site.html`, `css/case-study.css`, `js/case-study-charts.js`, `js/reading-progress.js`

### Phase 5: Blog System
**Goal**: Blog listing page + individual article pages with rich typography.

**Files**: `blog.html`, `blog/why-pms-should-code.html`, `blog/data-driven-product-decisions.html`, `blog/structured-thinking-framework.html`, `css/blog.css`, `js/blog-search.js`, `js/reading-progress.js`

### Phase 6: Contact, Now, & 404
**Goal**: Contact with form, /now page, 404 page.

**Files**: `contact.html`, `css/contact.css`, `js/contact-form.js`, `now.html`, `404.html`

### Phase 7: Data Layer & Polish
**Goal**: JSON data files, SEO meta tags for all pages, cross-page links, final integration testing.

**Files**: `assets/data/projects.json`, `assets/data/blog-posts.json`, all HTML pages (meta tag updates), `assets/resume/dhruv-singhal-resume.pdf`

### Phase 8: Testing & Optimization
**Goal**: Cross-browser, accessibility, performance, and final QA.

**Tests**:
- Lighthouse audit per page (target > 90 across all)
- axe DevTools accessibility scan per page
- Cross-browser: Chrome, Firefox, Safari, Edge
- Mobile: 320px, 375px, 768px, 1024px, 1440px
- Theme toggle on every page
- Command palette cross-page navigation
- All internal links work
- 404 page works for unknown routes
- Reduced-motion: disable all animations
- Print stylesheet: all pages print cleanly

---

## Migration Strategy from v2 → v3

### Files to KEEP (modify):
- `css/tokens.css` — Keep all tokens, add new page-specific tokens
- `css/base.css` — Keep, add blog typography
- `css/components.css` — Keep shared components, extract page-specific ones to their own files
- `css/animations.css` — Keep, add page transition keyframes
- `css/responsive.css` — Keep, add new page responsive rules
- `js/theme.js` — Keep as-is
- `js/cursor.js` — Keep as-is
- `js/toast.js` — Keep as-is
- `js/three-hero.js` — Keep, only loaded on home
- `js/particles-bg.js` — Keep, only loaded on home
- `js/skills-chart.js` — Keep, loaded on about page
- `js/carousel.js` — Keep, loaded on home
- `js/utils.js` — Keep, loaded selectively

### Files to MODIFY significantly:
- `js/app.js` — Add page detection, conditional init, page-specific module loading
- `js/command-palette.js` — Add cross-page navigation items
- `js/scroll-animations.js` — Make page-aware (different elements per page)

### Files to REMOVE:
- `css/sections.css` — Split into `home.css`, `about.css`, `projects.css`, etc.
- `js/modal.js` — No longer needed (case studies are now full pages)

### Files to CREATE (new):
- `about.html`, `projects.html`, `contact.html`, `blog.html`, `now.html`, `404.html`
- `case-studies/aarkid.html`, `case-studies/churn-analysis.html`, `case-studies/marketing-effectiveness.html`, `case-studies/portfolio-site.html`
- `blog/why-pms-should-code.html`, `blog/data-driven-product-decisions.html`, `blog/structured-thinking-framework.html`
- `css/home.css`, `css/about.css`, `css/projects.css`, `css/case-study.css`, `css/blog.css`, `css/contact.css`
- `js/page-transitions.js`, `js/project-filters.js`, `js/case-study-charts.js`, `js/blog-search.js`, `js/reading-progress.js`, `js/contact-form.js`
- `assets/data/projects.json`, `assets/data/blog-posts.json`

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content duplication across pages | Medium | Shared nav/footer as HTML includes pattern; structured data in JSON |
| Page load speed with per-page CSS/JS | Low | Only load what each page needs; CDN caching |
| SEO for multi-page static site | Medium | Unique meta tags per page, JSON-LD structured data, sitemap |
| Maintaining consistency across 14 pages | High | Shared layout template, CSS tokens, component library |
| Blog content maintenance | Low | JSON metadata + static HTML pages; easy to add new posts |
| File:// protocol compatibility | Medium | All links use relative paths, no server-side routing |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total pages | 14 | File count |
| Average time on site | > 3 minutes | Analytics (post-deploy) |
| Lighthouse Performance (per page) | > 90 | Lighthouse audit |
| Lighthouse Accessibility (per page) | > 95 | Lighthouse audit |
| Cross-browser compatibility | 4 browsers | Manual testing |
| Mobile responsiveness | 5 breakpoints | Manual testing |
| Console errors | 0 | DevTools |
| Broken links | 0 | Manual crawl |
