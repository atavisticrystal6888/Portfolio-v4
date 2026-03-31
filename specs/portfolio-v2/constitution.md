# Dhruv Singhal Portfolio v3 — Constitution

## Core Principles

### I. Multi-Page Modular Architecture
The portfolio is organized as a **multi-page static website** with 14 HTML pages, shared CSS/JS modules, and page-specific CSS/JS loaded only where needed. Each page has a dedicated purpose: Home (landing), About (deep dive), Projects (gallery), Case Studies (proof of PM skills), Blog (thought leadership), Contact (connection), Now (current focus), 404 (personality). All libraries loaded via CDN. No build tools, no bundlers — deploy to any static host or GitHub Pages.

### II. Depth Over Breadth
A single-page scroll is not enough to demonstrate product thinking. Each project gets a **dedicated case study page** with structured problem→action→outcome, metrics visualization, and learnings. Blog articles demonstrate thought leadership. The site should hold a visitor's attention for **15+ minutes**, not 30 seconds.

### III. Visual-First, Data-Backed
Every visual decision must serve the Product Manager/Builder narrative. Metrics are not decoration — they are proof. Animations are not flourish — they are storytelling. Case study charts visualize before→after impact. The site must feel like a product, not a template.

### IV. Performance & Accessibility Non-Negotiable
- First Contentful Paint < 1.8s per page
- Lighthouse > 90 on all four scores per page
- All interactive elements keyboard-navigable
- WCAG 2.1 AA compliant color contrast
- Graceful degradation: all pages usable without JS (content visible)
- Reduced-motion media query respected for all animations
- Page-specific JS/CSS: only load what each page needs

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
- **3D/WebGL**: Three.js r128 for hero particle mesh (Home only)
- **Animation**: GSAP 3.12 (ScrollTrigger) for scroll-driven cinematics (all pages)
- **Data Visualization**: Chart.js 4.x for skills radar + case study metrics
- **Typing Effects**: Typed.js for hero role cycling (Home only)
- **Icons**: Lucide Icons CDN (all pages)
- **Fonts**: Satoshi + Boska via Fontshare CDN
- **Particles**: tsParticles 2.x for ambient background (Home only)
- **Code Highlighting**: Prism.js for blog code blocks
- **Diagrams**: Mermaid.js for case study process flows
- **Utilities**: Vanilla JS IIFE pattern (window.DS* namespace)

### VII. File Organization
```
portfolio/
├── index.html                      # Home — hero + overview hub
├── about.html                      # Full bio, skills, experience, resume
├── projects.html                   # Project gallery with filters
├── case-studies/
│   ├── aarkid.html                 # Case Study — Aarkid
│   ├── churn-analysis.html         # Case Study — Churn Analysis
│   ├── marketing-effectiveness.html # Case Study — Marketing
│   └── portfolio-site.html         # Case Study — This Portfolio
├── blog.html                       # Blog listing with search
├── blog/
│   ├── why-pms-should-code.html
│   ├── data-driven-product-decisions.html
│   └── structured-thinking-framework.html
├── contact.html                    # Contact form + FAQ
├── now.html                        # /Now page
├── 404.html                        # Error page
├── css/
│   ├── tokens.css                  # Shared: design tokens
│   ├── base.css                    # Shared: reset, typography
│   ├── components.css              # Shared: nav, footer, buttons, cards
│   ├── animations.css              # Shared: keyframes, transitions
│   ├── responsive.css              # Shared: media queries
│   ├── home.css                    # Home page specific
│   ├── about.css                   # About page specific
│   ├── projects.css                # Projects page specific
│   ├── case-study.css              # Case study template
│   ├── blog.css                    # Blog listing + articles
│   └── contact.css                 # Contact page specific
├── js/
│   ├── app.js                      # Global: page-aware orchestrator
│   ├── theme.js                    # Global: dark/light toggle
│   ├── cursor.js                   # Global: custom cursor
│   ├── toast.js                    # Global: notifications
│   ├── command-palette.js          # Global: cross-page Ctrl+K
│   ├── scroll-animations.js        # Global: GSAP per-page
│   ├── page-transitions.js         # Global: smooth page nav
│   ├── three-hero.js               # Home: Three.js particles
│   ├── particles-bg.js             # Home: tsParticles
│   ├── utils.js                    # Home+About+Cases: counters, clipboard
│   ├── carousel.js                 # Home: testimonials
│   ├── skills-chart.js             # About: radar chart
│   ├── project-filters.js          # Projects: filter/sort
│   ├── case-study-charts.js        # Cases: metric charts
│   ├── blog-search.js              # Blog: search/filter
│   ├── reading-progress.js         # Articles+Cases: progress bar
│   └── contact-form.js             # Contact: form + FAQ
└── assets/
    ├── data/projects.json
    ├── data/blog-posts.json
    └── resume/dhruv-singhal-resume.pdf
```

### VIII. Simplicity Guardrail
No framework. No bundler. No npm install. Every library loaded via CDN. Every JS module is a standalone IIFE. If a 20-line vanilla implementation matches a library, skip the library. Every page loads only the CSS and JS it actually uses.

### IX. Shared Layout Principle
All 14 pages share a common HTML template: same nav, same footer, same cursor/toast/command-palette markup. The `<body data-page="...">` attribute drives page-specific behavior in JS. This ensures visual consistency while allowing per-page customization.

## Quality Gates
- All pages must have scroll-triggered entrance animations
- All interactive elements must have hover/focus/active states
- Dark/Light theme must be pixel-perfect in both modes on all pages
- Mobile-first responsive: 320px → 2560px on all pages
- No layout shifts on theme toggle or page transition
- Console must be error-free on all 14 pages
- Each CSS/JS file must have a clear single responsibility
- Page-specific JS/CSS must not load on pages that don't need it
- All internal links must resolve (zero 404s for site links)
- All case studies must follow the same template structure
- All blog articles must have reading progress and TOC

## Governance
This constitution governs all implementation decisions for the portfolio v3 multi-page build. Any structural changes require updating this document first.

**Version**: 3.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-03-31
