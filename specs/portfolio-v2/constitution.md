# Dhruv Singhal Portfolio v3 — Constitution

## Core Principles

### I. Multi-Page Modular Architecture
The portfolio is organized as a **multi-page application** with 14 routes, shared layout components, and per-route code splitting. Each page has a dedicated purpose: Home (landing), About (deep dive), Projects (gallery), Case Studies (proof of PM skills), Blog (thought leadership), Contact (connection), Now (current focus), 404 (personality). Built with Next.js App Router and deployed to Vercel.

> **v4.0 Amendment**: Originally mandated static HTML pages with CDN-only dependencies and no build tools. Amended to permit Next.js (React framework with SSR/SSG/ISR) to enable server-side rendering, API routes, incremental static regeneration, and modern developer tooling. The 14-route information architecture and per-page modularity principle are preserved.

### II. Depth Over Breadth
A single-page scroll is not enough to demonstrate product thinking. Each project gets a **dedicated case study page** with structured problem→action→outcome, metrics visualization, and learnings. Blog articles demonstrate thought leadership. The site should hold a visitor's attention for **15+ minutes**, not 30 seconds.

### III. Visual-First, Data-Backed
Every visual decision must serve the Product Manager/Builder narrative. Metrics are not decoration — they are proof. Animations are not flourish — they are storytelling. Case study charts visualize before→after impact. The site must feel like a product, not a template.

### IV. Performance & Accessibility Non-Negotiable
- First Contentful Paint < 1.8s per page
- Largest Contentful Paint < 2.0s per page
- Cumulative Layout Shift < 0.05 per page
- First Input Delay < 100ms per page
- Lighthouse > 95 on all four categories per page
- All interactive elements keyboard-navigable
- WCAG 2.1 AA compliant color contrast (≥4.5:1)
- Graceful degradation: all pages server-rendered with visible content before JS hydration
- Reduced-motion media query respected for all animations
- Per-route code splitting: only load what each route needs

### V. Enterprise-Grade UX Patterns
- Command palette (Ctrl+K) for cross-page navigation
- Scroll progress indicator on all pages
- Custom cursor with magnetic interactions
- Page transitions for smooth multi-page navigation
- Toast notification system for user feedback
- Reading progress bar on articles and case studies
- Project filtering with animated card sorting
- Blog search with real-time fuzzy matching
- Contact form with client-side validation
- FAQ accordion with smooth animations
- Testimonial carousel with auto-play + pause
- Breadcrumb navigation on inner pages

### VI. Technology Stack
- **Framework**: Next.js 14+ (App Router), React 18+, TypeScript 5.x
- **3D/WebGL**: React Three Fiber (wraps Three.js) for hero particle mesh (Home only)
- **Animation**: Framer Motion for scroll-driven animations and page transitions (all pages)
- **Data Visualization**: react-chartjs-2 (wraps Chart.js 4.x) for skills radar + case study metrics
- **Content Authoring**: MDX via @next/mdx for blog articles and case studies
- **Icons**: Lucide Icons via npm (all pages)
- **Fonts**: Satoshi, Boska, JetBrains Mono — self-hosted in /public/fonts with font-display: swap
- **Particles**: tsParticles 2.x via npm for ambient background (Home only)
- **Code Highlighting**: Prism.js or Shiki for blog code blocks
- **Diagrams**: Mermaid.js for case study process flows
- **Email**: Resend SDK for contact form delivery via Next.js API route
- **Analytics**: Vercel Analytics + Web Vitals (zero-cookie)
- **Styling**: CSS Modules (.module.css) for scoped component styles; global CSS for design tokens
- **Testing**: Vitest (unit), Playwright (E2E), axe-core (a11y), Lighthouse CI

> **v4.0 Amendment**: Replaced GSAP with Framer Motion (better App Router compatibility, shared layout animations). Replaced CDN loading with npm packages. Replaced Fontshare CDN with self-hosted fonts (performance + reliability). Replaced vanilla JS IIFE pattern with React component architecture. Added TypeScript, MDX, Resend, and Vercel Analytics.

### VII. File Organization
```
portfolio-next/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (nav, footer, providers)
│   │   ├── page.tsx                # Home (/)
│   │   ├── not-found.tsx           # Custom 404
│   │   ├── globals.css             # Global CSS imports
│   │   ├── about/page.tsx          # /about
│   │   ├── projects/
│   │   │   ├── page.tsx            # /projects
│   │   │   └── [slug]/page.tsx     # /projects/[slug] (case studies)
│   │   ├── blog/
│   │   │   ├── page.tsx            # /blog
│   │   │   └── [slug]/page.tsx     # /blog/[slug] (articles)
│   │   ├── contact/page.tsx        # /contact
│   │   ├── now/page.tsx            # /now
│   │   ├── api/contact/route.ts    # Contact form API (Resend)
│   │   └── sitemap.ts              # Dynamic sitemap
│   ├── components/                 # React components (layout/, ui/, interactive/, page-specific/)
│   ├── lib/                        # Utilities (content.ts, github.ts, suggestions.ts, metadata.ts)
│   ├── hooks/                      # Custom hooks (useTheme, useBehavior, useReducedMotion, etc.)
│   ├── styles/                     # Global CSS (tokens.css, base.css, animations.css, print.css)
│   └── types/                      # TypeScript type definitions
├── content/                        # Content data (JSON + MDX files)
├── public/fonts/                   # Self-hosted fonts
├── tests/                          # Vitest, Playwright, axe-core
└── scripts/                        # Build & CI scripts
```

> **v4.0 Amendment**: Replaced flat HTML/CSS/JS file structure with Next.js App Router directory conventions. Component-per-feature organization replaces monolithic CSS/JS files. CSS Modules replace page-specific CSS. React components replace IIFE JS modules. Content moved to `content/` directory as JSON + MDX.

### VIII. Simplicity Guardrail
Prefer the simplest solution that meets the requirement. If a 20-line utility matches a library, skip the library. Every route loads only the CSS and JS it needs (per-route code splitting). Avoid over-abstraction — components should be extracted only when reused across 2+ pages.

> **v4.0 Amendment**: Originally prohibited all frameworks, bundlers, and npm. Amended to permit Next.js + npm ecosystem because SSR, ISR, API routes, and TypeScript tooling are required for v3 features (GitHub ISR, Resend contact form, `next/image` optimization, structured metadata API). The principle of minimal complexity per feature is preserved.

### IX. Shared Layout Principle
All 14 routes share a common root layout (`layout.tsx`): same nav, same footer, same cursor/toast/command-palette components. File-based routing with the App Router replaces `data-page` attributes. This ensures visual consistency while allowing per-route customization via nested layouts and page-specific components.

## Quality Gates
- Lighthouse > 95 on all four categories across all 14 routes
- Core Web Vitals: FCP < 1.8s, LCP < 2.0s, FID < 100ms, CLS < 0.05
- All pages must have scroll-triggered entrance animations (respecting prefers-reduced-motion)
- All interactive elements must have hover/focus/active states
- Dark/Light theme must be pixel-perfect in both modes on all pages
- Mobile-first responsive: 320px → 2560px on all pages
- No layout shifts on theme toggle or page transition
- Console must be error-free on all 14 routes
- Per-route code splitting: total JS per route < 150KB gzipped (excluding async Three.js on Home)
- All internal links must resolve (zero 404s for site links)
- All case studies must follow the same template structure
- All blog articles must have reading progress and TOC
- WCAG 2.1 AA compliance verified via axe-core on all 14 routes

## Governance
This constitution governs all implementation decisions for the portfolio v3 build. Any structural changes require updating this document first.

**Version**: 4.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-04-01

### Amendment Log
| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2026-03-31 | Initial v3 constitution for static HTML/CSS portfolio |
| 4.0 | 2026-04-01 | Amended Principles I, VI, VII, VIII for Next.js migration. Updated Quality Gates with binding metric targets (FCP, LCP, CLS, Lighthouse > 95). Added amendment log. |
