# Research: Portfolio v3 — Technology Decisions

**Branch**: `portfolio-v3-nextjs` | **Date**: 2026-03-31  
**Purpose**: Resolve all NEEDS CLARIFICATION items and document technology decisions with rationale.

---

## Decision 1: Next.js App Router (confirmed via /speckit.clarify)

**Decision**: Use Next.js 14+ App Router (`app/` directory) with React Server Components  
**Rationale**: App Router is the current standard for new Next.js projects. Native layout nesting eliminates the shared-layout duplication problem. React Server Components reduce client JS bundle (only interactive components ship JS). Built-in `metadata` export API replaces manual `<Head>` management. Streaming SSR improves TTFB.  
**Alternatives considered**:
- Pages Router — Mature but lacks Server Components, nested layouts, and streaming. Would require `_app.tsx` + `_document.tsx` workarounds for shared layout.
- Hybrid (partial App Router) — Adds complexity for no clear benefit when starting fresh.

---

## Decision 2: CSS Modules (confirmed via /speckit.clarify)

**Decision**: CSS Modules (`.module.css`) for component scoping, global CSS for tokens/base/animations  
**Rationale**: Zero-config in Next.js, zero runtime JS overhead, produces hashed class names for scope isolation. Works perfectly with SSR (no flash of unstyled content). The existing `tokens.css` (400+ lines of CSS custom properties) transfers directly as a global import — no translation layer needed.  
**Alternatives considered**:
- Tailwind CSS — Requires translating all design tokens to `tailwind.config.js`, loses the glassmorphism-via-CSS-custom-properties pattern that's central to the design.
- styled-components — Runtime JS overhead, requires SSR configuration for App Router, and the team's existing CSS is already excellent.
- Vanilla CSS (global) — No scoping, naming collisions risk increases with 20+ components.

---

## Decision 3: Vercel Deployment (confirmed via /speckit.clarify)

**Decision**: Deploy to Vercel with full feature support (ISR, API routes, edge middleware, analytics)  
**Rationale**: Vercel is purpose-built for Next.js. ISR enables GitHub data refresh without rebuild. API routes power the Resend-based contact form. `@vercel/analytics` + `@vercel/speed-insights` provide zero-config, cookie-free monitoring. Free tier (100GB bandwidth, 100 function invocations/day) easily covers portfolio traffic.  
**Alternatives considered**:
- GitHub Pages (`next export`) — No ISR (GitHub sync breaks), no API routes (contact form fails), no image optimization. Requires external services for every server-side feature.
- Netlify — Viable but less integrated with Next.js. ISR support via On-Demand Builders adds latency.

---

## Decision 4: Framer Motion for Animations

**Decision**: Framer Motion as the primary animation library, replacing GSAP  
**Rationale**: First-class React integration with `motion` components, `AnimatePresence` for exit animations, `useScroll` for scroll-triggered effects, and `layout` prop for shared layout transitions. Works natively with App Router's route changes. Declarative API fits React's component model better than GSAP's imperative approach. Tree-shakeable — only import what's used.  
**Alternatives considered**:
- GSAP (kept from v2) — Imperative API requires refs and useEffect, awkward with Server Components, not tree-shakeable (full bundle always loaded). ScrollTrigger plugin adds ~30KB.
- CSS animations only — Insufficient for complex page transitions, scroll-triggered sequences, and staggered animations.
- React Spring — Good physics-based animations but less mature route transition support vs Framer Motion.

---

## Decision 5: React Three Fiber for 3D Hero

**Decision**: React Three Fiber (`@react-three/fiber` + `@react-three/drei`) for the 3D particle hero  
**Rationale**: Wraps Three.js in React's component model — particles, lights, and cameras as JSX. Integrates with React lifecycle (cleanup on unmount, re-render on prop change). `@react-three/drei` provides pre-built helpers (OrbitControls, PerformanceMonitor, AdaptiveDpr). GPU tier detection via `detect-gpu` library enables automatic quality scaling.  
**Alternatives considered**:
- Raw Three.js (kept from v2) — Requires manual lifecycle management (init, resize, dispose) via useEffect. No React integration for theme-reactive particle colors.
- Babylon.js — Heavier runtime, overkill for a particle sphere.

---

## Decision 6: MDX for Blog & Case Study Content

**Decision**: `@next/mdx` with frontmatter (via `gray-matter`) for blog articles and case studies  
**Rationale**: Authors write Markdown with embedded React components (interactive charts, callout boxes, live demos). Next.js App Router treats MDX files as pages when placed in `app/`, or they can be loaded as data via `fs` in Server Components. Frontmatter provides structured metadata (title, date, category, tags, reading time).  
**Alternatives considered**:
- Static HTML (kept from v2) — No component embedding, no frontmatter, manual HTML maintenance.
- Contentlayer — Excellent but maintenance uncertain; `@next/mdx` is first-party supported.
- Sanity/Contentful CMS — Overkill for 7 content pages, adds external dependency and build complexity.

---

## Decision 7: Resend for Email Delivery (confirmed via /speckit.clarify)

**Decision**: Resend SDK via Next.js API route (`app/api/contact/route.ts`)  
**Rationale**: Developer-first API, 100 emails/day free tier (sufficient for portfolio contact form), React Email for templating, built-in rate limiting metadata, simple SDK (`resend.emails.send()`), excellent deliverability via dedicated IPs. Single environment variable (`RESEND_API_KEY`).  
**Alternatives considered**:
- Nodemailer + SMTP — Requires SMTP credentials (Gmail app passwords), less reliable deliverability, no built-in analytics.
- SendGrid — More complex setup, heavier SDK, enterprise-oriented.
- Formspree — No API route needed but less control over validation, rate limiting, and response format.

---

## Decision 8: Vercel Analytics (confirmed via /speckit.clarify)

**Decision**: `@vercel/analytics` + `@vercel/speed-insights` for monitoring  
**Rationale**: Zero-config on Vercel deployment. Real-user Core Web Vitals (LCP, FID, CLS, TTFB) tracked automatically. Page views without cookies — GDPR-friendly, no consent banner needed. Integrates with Vercel dashboard for deploy-correlated performance tracking.  
**Alternatives considered**:
- No analytics — Loses visibility into which pages perform well and where visitors spend time.
- Google Analytics 4 — Cookie-based, requires consent banner, GDPR overhead.
- Plausible — Privacy-friendly but requires separate hosting/billing and manual SDK setup.

---

## Decision 9: Chart.js via react-chartjs-2

**Decision**: Keep Chart.js (via `react-chartjs-2` React wrapper) for skills radar and case study metric charts  
**Rationale**: Existing chart configurations and data structures from v2 transfer directly. `react-chartjs-2` provides declarative `<Radar>`, `<Bar>`, `<Doughnut>` components. Tree-shakeable with Chart.js 4 (register only needed chart types). Theme-reactive via dynamic options update on theme change.  
**Alternatives considered**:
- Recharts — React-native but less flexible for custom radar charts.
- D3.js — Overkill for pre-defined chart types, imperative API.
- Nivo — Beautiful defaults but heavier bundle.

---

## Decision 10: Testing Strategy

**Decision**: Vitest (unit) + Playwright (E2E) + axe-core (a11y) + Lighthouse CI (perf/SEO)  
**Rationale**:
- **Vitest**: Fast, ESM-native, compatible with TypeScript out of the box. Tests pure functions (suggestions scoring, metadata generation, content parsing).
- **Playwright**: Cross-browser E2E (Chrome, Firefox, Safari). Tests navigation, theme persistence, form submission, responsive behavior.
- **axe-core**: Industry-standard WCAG 2.1 AA automated checking. Runs in Playwright via `@axe-core/playwright`.
- **Lighthouse CI**: Automated performance/SEO/a11y/best-practices scoring in CI pipeline. Blocks deployment if thresholds not met.

**Alternatives considered**:
- Jest — Slower than Vitest for ESM projects, requires more configuration.
- Cypress — Slower than Playwright, no native Safari support.

---

## Decision 11: WebXR for AR/VR (Progressive Enhancement)

**Decision**: WebXR Device API via `@react-three/xr` for AR/VR case study exploration  
**Rationale**: Builds on React Three Fiber (already in use for 3D hero). `@react-three/xr` adds `<XR>`, `<ARButton>`, `<VRButton>` components. Progressive enhancement only — hidden on unsupported devices, standard Mermaid diagrams shown as fallback. Lazy-loaded (`next/dynamic`) to avoid impacting non-AR page bundles.  
**Alternatives considered**:
- A-Frame — Higher-level but doesn't integrate with React Three Fiber's scene graph.
- Raw WebXR API — Too low-level, `@react-three/xr` abstracts session management.
- Skip entirely — Feasible for MVP but removes a key differentiating showcase feature.
