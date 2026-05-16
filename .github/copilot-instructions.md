# General Instructions

Always reason thoroughly and deeply. Treat every request as complex unless I explicitly say otherwise. Never optimise for brevity at the expense of quality. Think step-by-step, consider trade-offs, and provide comprehensive analysis.

# Project Guidelines

## Overview

Multi-page static portfolio (v2 → v3) for a Product Analyst & Builder. 14 HTML pages with dedicated case study and blog article pages. No build tools — CDN-only dependencies, deployable to GitHub Pages.

See [specs/portfolio-v2/constitution.md](../specs/portfolio-v2/constitution.md) for design philosophy and [specs/portfolio-v2/spec.md](../specs/portfolio-v2/spec.md) for full technical specification.

## Architecture

### Page Structure (14 pages)
- **Hub**: `index.html` (home)
- **Deep Dives**: About, Projects
- **Case Studies**: Aarkid, Churn Analysis, Marketing, Portfolio (4 dedicated pages)
- **Blog**: 1 listing + 3 article pages
- **Connect**: Contact, Now, 404

### Page Detection
Every page sets `<body data-page="home|about|projects|case-study|blog|article|contact|now|404">`. The orchestrator (`app.js`) reads this attribute and conditionally initializes only the modules that page needs.

### CSS Architecture (5 shared + 6 page-specific)
| File | Responsibility |
|------|----------------|
| `tokens.css` | Design tokens, CSS custom properties, dark/light theme vars |
| `base.css` | Reset, typography primitives |
| `components.css` | Nav, footer, buttons, cards, modals, toast, cursor, command palette |
| `animations.css` | Keyframes, GSAP hooks, `prefers-reduced-motion` support |
| `responsive.css` | Media queries for shared components |
| `home.css`, `about.css`, `projects.css`, `case-study.css`, `blog.css`, `contact.css` | Page-specific styles |

### JavaScript Architecture (7 global + 10 page-specific)
All JS modules use the **IIFE + window namespace** pattern:
```javascript
(function () {
  'use strict';
  // private implementation
  window.DSModuleName = { publicMethods };
})();
```

**Global** (loaded on all pages): `app.js`, `theme.js`, `cursor.js`, `toast.js`, `command-palette.js`, `scroll-animations.js`, `page-transitions.js`

**Conditional** (loaded per `data-page`): `three-hero.js`, `particles-bg.js`, `utils.js`, `carousel.js`, `skills-chart.js`, `project-filters.js`, `case-study-charts.js`, `reading-progress.js`, `blog-search.js`, `contact-form.js`

## Code Style

- **JavaScript**: Vanilla ES5+ with `'use strict'` in every IIFE. No frameworks. All public APIs exposed as `window.DS*` (e.g., `window.DSTheme`, `window.DSCarousel`).
- **CSS**: CSS custom properties for theming. Mobile-first breakpoints. BEM-like class naming (`.project-card`, `.skill-tag`). Use design tokens from `tokens.css` — never hardcode colors, spacing, or font values.
- **HTML**: Semantic elements, ARIA attributes, `data-` attributes for JS hooks. No inline styles except in the loading screen.

## Conventions

- **Theme toggle**: Uses `localStorage` key `theme`. Apply via CSS custom properties — both themes must render with identical dimensions (no layout shift).
- **Conditional loading**: Only load CSS/JS needed per page. Home doesn't load `blog.css`; Projects doesn't load `three-hero.js`.
- **Animation pattern**: All entrance animations use GSAP ScrollTrigger. Respect `prefers-reduced-motion: reduce` — disable all animations.
- **Command palette**: Must include all 14 pages + 4 case studies + 3 blog articles as navigation targets.
- **Case study prev/next**: Circular navigation: Aarkid ↔ Churn ↔ Marketing ↔ Portfolio ↔ Aarkid.

## CDN Dependencies

| Library | Purpose | Scope |
|---------|---------|-------|
| Three.js r128 | 3D WebGL hero particles | Home only |
| GSAP 3.12.5 + ScrollTrigger | Scroll animations | All pages |
| Chart.js 4.4.0 | Skills radar, metrics charts | About, case studies |
| tsParticles 2.12.0 | Ambient particle background | Home only |
| Typed.js 2.1.0 | Hero typing effect | Home only |
| Lucide Icons | SVG icon system | All pages |
| Fontshare | Satoshi + Boska fonts | All pages |
| Prism.js 1.29 | Code syntax highlighting | Blog, case studies |
| Marked.js 12.x | Markdown rendering | Blog articles |
| Mermaid.js 10.x | Process flow diagrams | Case studies |

## Quality Gates

- Lighthouse > 90 on all four categories per page
- LCP < 2.5s, CLS < 0.1, FCP < 1.8s
- WCAG 2.1 AA color contrast, keyboard navigable, ARIA landmarks
- All content visible without JS (graceful degradation)
- Zero console errors, zero broken internal links
- Print-friendly: hide nav/footer/cursor

## Task Tracking

Development follows 8 phases with 56 tasks. See [specs/portfolio-v2/tasks.md](../specs/portfolio-v2/tasks.md) for the full breakdown and [specs/portfolio-v2/plan.md](../specs/portfolio-v2/plan.md) for the execution plan.
