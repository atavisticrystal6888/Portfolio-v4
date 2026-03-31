# Tasks: Dhruv Singhal Portfolio v3 — Multi-Page Architecture

**Input**: specs/portfolio-v2/plan.md (v3), specs/portfolio-v2/spec.md, specs/portfolio-v2/constitution.md  
**Architecture**: Multi-page static website (14 HTML pages, 11 CSS files, 17 JS files)  
**Migration from**: v2 single-page (portfolio/index.html + css/* + js/*)

---

## Phase 1: Shared Foundation & Layout System
> **Goal**: Shared CSS + JS modules work correctly across all pages. Nav links to pages. Page detection system. Page transitions.

### Step 1.1: CSS Architecture Refactoring
- [ ] T001 Update `css/tokens.css` — Add new tokens: `--page-header-height`, `--sidebar-width`, `--reading-width: 680px`, `--toc-width: 220px`, code block colors (prism tokens), callout colors (tip/warning/info), case-study-specific tokens (process-step colors)
- [ ] T002 Update `css/base.css` — Add blog typography rules: blockquote styling, inline code, figure/figcaption, article-specific heading hierarchy, .reading-width utility class
- [ ] T003 Refactor `css/components.css` — Extract page-specific sections (hero, metrics, timeline, etc.) into page CSS files. Keep: nav, footer, buttons, cards, badges, toast, cursor, command palette, scroll progress bar, breadcrumbs (new), page header component (new), filter bar component (new), FAQ accordion (new)
- [ ] T004 Update `css/animations.css` — Add page transition keyframes (`pageEnter`, `pageExit`, `fadeInPage`), add case-study-specific animations (process-step reveal, metric counter grow), blog reading progress bar animation
- [ ] T005 Update `css/responsive.css` — Add responsive rules for new components: breadcrumbs, filter bar, sidebar TOC, contact form, FAQ accordion, page header. Update nav responsive for multi-page active state

### Step 1.2: Page-Specific CSS Creation
- [ ] T006 [P] Create `css/home.css` — Extract from old sections.css: hero section, metrics bar grid, featured projects 3-card grid, about teaser, testimonial carousel track, blog teaser 3-card grid, contact CTA strip
- [ ] T007 [P] Create `css/about.css` — Philosophy section (quote card, 2-column layout), skills dashboard (radar container + skill category cards), detailed timeline (expanded bullets, tech badges per role), education section, achievements grid, resume download button, values/traits grid cards
- [ ] T008 [P] Create `css/projects.css` — Project filter bar (pill buttons with count), project grid (3-column with animated entry), sort dropdown, project card (enhanced with thumbnail placeholder, category badge, metric badge)
- [ ] T009 [P] Create `css/case-study.css` — Case study hero banner (full-width, project name, role, timeline), TL;DR box (bordered callout), process flow (numbered steps with connector lines), metric visualization section (before/after cards, chart container), code block styling (prism theme integration), prev/next navigation bar, related posts strip
- [ ] T010 [P] Create `css/blog.css` — Blog listing header, category pills, search input, article card grid, article page: reading progress bar, TOC sidebar (sticky), article body rich typography (h2-h4, blockquotes, callout boxes, code blocks, images with captions, ordered/unordered lists), author card, article nav (prev/next), related articles strip
- [ ] T011 [P] Create `css/contact.css` — Contact hero (availability badge), contact form (input groups, textarea, submit button, validation states), direct links card grid, FAQ accordion (collapsible with chevron rotation), location/timezone badge

### Step 1.3: Global JS Module Updates
- [ ] T012 Update `js/app.js` — Major refactor: detect `data-page` from body, conditional module init based on page type, init shared modules (theme, cursor, toast, cmd palette, scroll anims, page transitions), init page-specific modules based on page type mapping
- [ ] T013 Update `js/command-palette.js` — Replace section anchors with cross-page navigation: "Go to Home"→index.html, "Go to About"→about.html, "Go to Projects"→projects.html, "Go to Blog"→blog.html, "Go to Contact"→contact.html. Add case study entries and blog article entries. Keep: theme toggle, copy email, open LinkedIn
- [ ] T014 Update `js/scroll-animations.js` — Make page-aware: detect `data-page`, apply different animation configurations per page. Generic `.fade-in` works on all pages. Page-specific: home (hero parallax, metrics stagger), about (timeline left-slide), projects (card stagger), case-study (process step reveals), blog (card stagger)
- [ ] T015 [P] Create `js/page-transitions.js` — On internal link click (same-origin, not anchor): add `.page-exit` class to `<main>`, wait 200ms, navigate. On DOMContentLoaded: add `.page-enter` class to `<main>`, remove after 300ms animation. Detect internal links via `[href$=".html"]` or relative paths. Skip for external links and anchor-only links

### Step 1.4: Remove Deprecated Files
- [ ] T016 Delete `css/sections.css` (content migrated to page-specific CSS files)
- [ ] T017 Delete `js/modal.js` (case studies are now full pages, modals no longer needed)

**Checkpoint**: Nav renders on a blank test page, links point to (not-yet-created) pages, command palette shows cross-page items, page transition animation fires on link click.

---

## Phase 2: Home Page (index.html)
> **Goal**: Home page is a polished landing hub that funnels visitors to deeper pages. Not everything lives here — it's a teaser.

- [ ] T018 Create `index.html` — Complete rebuild as multi-page-aware landing page:
  - Shared layout (skip link, cursor, scroll progress, toast, command palette, nav, footer)
  - Hero section: 3D canvas, particles-bg, typed roles, hero statement, CTA buttons ("Explore My Work", "Get in Touch")
  - Metrics bar (same 5 metrics from v1)
  - About teaser: 2-sentence intro + "Learn more about me →" link to about.html
  - Featured projects: 3 cards (from v1 project data) each with "Read Case Study →" linking to case-studies/*.html + "View All Projects →" link to projects.html
  - Testimonial carousel (3 quotes)
  - Blog teaser: "Latest Thoughts" heading + 3 article cards → "Read All Posts →" linking to blog.html
  - Contact CTA strip: "Let's build together" + email + LinkedIn CTAs
  - `data-page="home"` on body
  - Script tags: shared JS + three-hero, particles-bg, utils, carousel
  - CSS: shared + home.css
- [ ] T019 Update `js/three-hero.js` — Verify works with new index.html canvas element, no changes expected unless DOM IDs changed
- [ ] T020 Update `js/carousel.js` — Verify works with new index.html structure, no changes expected

**Checkpoint**: Home page loads with 3D hero, typed roles, metrics animate, featured project cards link to case study pages (404 for now), blog teasers link to blog articles (404 for now), theme toggle works, command palette has cross-page navigation.

---

## Phase 3: About Page
> **Goal**: Comprehensive "who is Dhruv" page with interactive skills dashboard.

- [ ] T021 Create `about.html` — Full about page:
  - Shared layout + `data-page="about"` 
  - Page header: name, title, brief tagline
  - Product philosophy section: "How I Think About Product" — 3 philosophy cards (e.g., "Outcome > Output", "Data Informs, Intuition Decides", "Ship, Measure, Iterate")
  - Full bio (expanded from v1 about text, 3-4 paragraphs)
  - Skills dashboard section:
    - Interactive radar chart (canvas)
    - Skill category cards (PM & Analytics, Technical, Tools, Soft Skills)
    - Each card has skill tags with subtle hover effects
  - Experience timeline (full detail from v1): Wipro, Odena, Read Riches, Omniful.ai with expanded bullet points
  - Education section (edu-card from v1)
  - Achievements & recognition grid (from v1)
  - Values section: 4 cards (High-Ownership, Low-Dependency, Data-First, Fast Execution) with icons and short descriptions  
  - Resume download CTA: "Download My Resume (PDF)" → assets/resume/dhruv-singhal-resume.pdf
  - Script tags: shared JS + skills-chart, utils
  - CSS: shared + about.css
- [ ] T022 Update `js/skills-chart.js` — Verify works on about.html, may need to add extra datasets or categories. Confirm canvas ID matches

**Checkpoint**: About page loads, skills radar draws and reacts to theme, timeline displays properly, achievements grid renders, all sections have scroll animations, resume link is present (even if PDF doesn't exist yet).

---

## Phase 4: Projects & Case Studies
> **Goal**: Browsable project gallery + deep-dive case study pages that prove PM skills.

### Step 4.1: Projects Listing Page
- [ ] T023 Create `projects.html` — Project listing page:
  - Shared layout + `data-page="projects"`
  - Page header: "Projects" title + subtitle ("Problem → Action → Outcome") + project count badge
  - Filter bar: pills for All, Product, Data, AI, Technical (with count per category)
  - Project cards grid (3 columns on desktop):
    - Each card: project name, category badge, 1-line summary, tech stack chips (max 3 visible + "+N"), key metric badge, "Read Case Study →" link
    - Cards animate in with stagger on page load
    - Filter switching re-animates visible cards
  - All 4 projects: Aarkid, Churn Analysis, Marketing Effectiveness, Portfolio
  - Script tags: shared JS + project-filters
  - CSS: shared + projects.css
- [ ] T024 Create `js/project-filters.js` — IIFE module:
  - Read filter pills, attach click handlers
  - Show/hide project cards based on `data-category` attribute
  - Update active filter pill styling
  - Animate cards in/out on filter change (opacity + translateY)
  - Update project count badge
  - URL hash-based filter persistence (e.g., projects.html#ai)
  - Expose `window.DSProjectFilters`

### Step 4.2: Case Study Template Pages
- [ ] T025 Create `case-studies/aarkid.html` — Aarkid Flora Monitoring case study:
  - Shared layout + `data-page="case-study"`
  - Breadcrumb: Home → Projects → Aarkid
  - Hero banner: "Aarkid — Flora Monitoring System", role: "Product Builder", duration: "2025", stack chips
  - TL;DR box: 2-sentence summary with key metric highlighted
  - Context & Problem: Plant owners lacked personalized real-time care guidance. No existing tool combined vision AI with task management.
  - Research & Discovery: User interviews with plant enthusiasts, competitive analysis of plant care apps, identified gap in AI-powered personalization
  - Solution & Approach: Built AI-powered app using Gemini Pro Vision + text models. Architecture: FastAPI backend → LangChain orchestration → Gemini Pro Vision for image analysis → text model for recommendations.
  - Implementation: Key technical decisions, challenges overcome, tech stack justification
  - Outcome & Metrics: Full AI product delivered end-to-end. Chart showing feature completeness, user flow coverage.
  - Learnings: What worked, what would change, technical and product insights
  - Nav: ← Previous (Marketing) | Next → (Churn Analysis)
  - Script tags: shared JS + case-study-charts, reading-progress, utils
  - CSS: shared + case-study.css

- [ ] T026 Create `case-studies/churn-analysis.html` — Customer Churn Analysis case study:
  - Same template structure as T025
  - Problem: Rising churn with no root-cause visibility
  - Action: EDA + customer segmentation, Power BI dashboards for KPIs
  - Outcome: ~15% potential churn reduction, data-driven retention strategies
  - Charts: Churn rate trend (line chart), customer segment breakdown (bar chart)
  - Nav: ← Previous (Aarkid) | Next → (Marketing)

- [ ] T027 Create `case-studies/marketing-effectiveness.html` — Marketing Campaign Effectiveness:
  - Same template structure
  - Problem: Budget allocation without ROI visibility
  - Action: Multi-channel campaign evaluation, conversion analysis
  - Outcome: Dashboard-driven budget optimization
  - Charts: Channel ROI comparison (bar chart), conversion funnel (funnel visualization)
  - Nav: ← Previous (Churn) | Next → (Portfolio)

- [ ] T028 Create `case-studies/portfolio-site.html` — This Portfolio (meta case study):
  - Same template structure
  - Problem: Needed to stand out as a PM candidate with limited traditional PM experience
  - Action: Applied PM thinking to portfolio itself — user research (recruiter interviews), spec writing, iterative builds (v1→v2→v3)
  - Outcome: Multi-page enterprise-grade portfolio demonstrating product thinking
  - Charts: Tech stack complexity over versions (bar chart), feature count growth
  - Nav: ← Previous (Marketing) | Next → (Aarkid)

### Step 4.3: Case Study Charts Module
- [ ] T029 Create `js/case-study-charts.js` — IIFE module:
  - Read chart containers from DOM (`[data-chart]` elements)
  - Each chart has `data-chart-type` (line, bar, doughnut) and `data-chart-config` (JSON)
  - Initialize Chart.js instances per container
  - Theme-reactive: listen to `themechange`, update chart colors
  - Animate on scroll into view (Chart.js animation delay until visible)
  - Expose `window.DSCaseStudyCharts`

**Checkpoint**: Projects page loads, filters work (All/Product/Data/AI/Technical), each project card links to its case study page. All 4 case study pages render with full content, charts draw, reading progress works, prev/next navigation works between case studies.

---

## Phase 5: Blog System
> **Goal**: Blog listing with search/filter + 3 fully-written article pages.

### Step 5.1: Blog Listing Page
- [ ] T030 Create `blog.html` — Blog listing page:
  - Shared layout + `data-page="blog"`
  - Page header: "Thoughts on Product, Data & Building"
  - Category filter pills: All, Product, Data, Career, Technical
  - Search input with real-time fuzzy filtering
  - Article cards in grid (2-column on desktop):
    - Each card: title, publication date, reading time, category tag, 2-line excerpt, "Read →" link
  - 3 articles listed
  - Script tags: shared JS + blog-search
  - CSS: shared + blog.css

- [ ] T031 Create `js/blog-search.js` — IIFE module:
  - Fuzzy text search on article titles and excerpts
  - Category filter via pills (similar pattern to project-filters)
  - Real-time filtering as user types (debounced 200ms)
  - Show "No articles found" state
  - URL hash filter persistence
  - Expose `window.DSBlogSearch`

### Step 5.2: Blog Article Pages
- [ ] T032 Create `blog/why-pms-should-code.html` — Full article:
  - Shared layout + `data-page="article"`
  - Article header: title, date (March 28, 2026), reading time (6 min), category (Career)
  - Reading progress bar at page top
  - Sticky TOC sidebar (auto-generated from h2/h3 headings)
  - Article body (~1000 words): 
    - Hook: Why the debate matters
    - Section 1: "The Case For Coding" — understanding engineering constraints, building prototypes, speaking the same language
    - Section 2: "When To Stop" — knowing when you're doing the engineer's job, diminishing returns, the PM/engineer boundary
    - Section 3: "The Sweet Spot" — SQL, basic scripting, API understanding, reading code > writing code
    - Conclusion: Practical advice for PMs at different levels
  - Code block examples (Prism.js highlighted)
  - Author card at bottom (Dhruv Singhal, Product Analyst & Builder, photo placeholder)
  - Nav: Next → "Data-Driven Product Decisions"
  - Related articles section
  - Script tags: shared JS + reading-progress
  - CSS: shared + blog.css

- [ ] T033 Create `blog/data-driven-product-decisions.html` — Full article:
  - Same template structure
  - Title: "Data-Driven Doesn't Mean Dashboard-Driven"
  - ~800 words on the pitfall of equating dashboards with data-driven culture
  - Sections: The Dashboard Trap, Signals vs Noise, The Decision Framework, When to Trust Your Gut
  - Callout boxes for key quotes
  - Nav: ← Previous | Next → "Structured Thinking Framework"

- [ ] T034 Create `blog/structured-thinking-framework.html` — Full article:
  - Same template structure
  - Title: "A Structured Thinking Framework for Ambiguous Problems"
  - ~900 words on Dhruv's approach to breaking down ambiguous problems as a PM
  - Sections: Why Ambiguity Is the PM's Job, The 4-Step Framework (Scope, Decompose, Prioritize, Execute), Real Example (applied to a project), Common Pitfalls
  - Mermaid diagram of the framework flow
  - Nav: ← Previous | (none — last article)

### Step 5.3: Reading Progress Module
- [ ] T035 Create `js/reading-progress.js` — IIFE module:
  - Calculate reading progress based on scroll position relative to article body
  - Update a progress bar element (`.reading-progress-bar`) width
  - Works on both case-study and article pages
  - Auto-detect article container: `.article-body` or `.case-study-content`
  - Show estimated reading time remaining
  - Expose `window.DSReadingProgress`

**Checkpoint**: Blog listing page shows 3 articles, category filters work, search works. Each article page has full content, reading progress bar fills as you scroll, TOC sidebar highlights current section. All links between articles work (prev/next, related).

---

## Phase 6: Contact, Now & 404
> **Goal**: Contact page with form, /now page, and a charming 404.

- [ ] T036 Create `contact.html` — Contact page:
  - Shared layout + `data-page="contact"`
  - Availability hero: large "Open to Opportunities" with pulsing green dot and subtitle listing target roles
  - Contact form card:
    - Fields: Name (required), Email (required, validated), Subject dropdown (General, Collaboration, Hiring, Speaking, Other), Message (required, textarea)
    - Submit button constructs mailto: link with subject + body and opens email client
    - Client-side validation with error messages (red border, error text below field)
    - Success toast on submit
  - Direct links card grid (2×2):
    - Email (copy to clipboard), LinkedIn (opens tab), GitHub (opens tab), Twitter/X (opens tab)
  - FAQ accordion:
    - "What roles are you looking for?" → Product Analyst, APM, data-driven PM roles
    - "Are you open to remote/relocation?" → Yes, open to both
    - "What's the best way to reach you?" → LinkedIn DM or email
    - "Are you available for freelance/consulting?" → Selectively, for interesting products
  - Location & timezone: "Based in India (IST, UTC+5:30)"
  - Script tags: shared JS + contact-form
  - CSS: shared + contact.css

- [ ] T037 Create `js/contact-form.js` — IIFE module:
  - Form validation: required fields, email regex, minimum message length (20 chars)
  - Error state management: add/remove error classes, show/hide error messages
  - On valid submit: construct `mailto:dhruvsinghal6888@gmail.com?subject=...&body=...` and `window.location.href` to it
  - Show success toast via DSToast
  - FAQ accordion: toggle `.open` class on click, animate max-height, rotate chevron icon
  - Expose `window.DSContactForm`

- [ ] T038 Create `now.html` — /Now page:
  - Shared layout + `data-page="now"`
  - Minimal page header: "What I'm Doing Now" + last updated date
  - Sections (each with an icon):
    - **Working on**: Product Intern at Wipro (Aviation OS team), Product & Analytics Consultant at Odena
    - **Learning**: Advanced product analytics, system design, growth frameworks
    - **Reading**: List 2-3 current books/articles
    - **Building**: This portfolio site, project ideas dashboard
    - **Looking for**: Full-time Product Analyst / APM roles starting mid-2026
  - Footer note: "This is a /now page, inspired by Derek Sivers' nownownow.com movement"
  - CSS: shared only (minimal styling, uses base typography)

- [ ] T039 Create `404.html` — Error page:
  - Shared layout (nav only, no command palette or cursor) + `data-page="404"`
  - Large "404" number with gradient text
  - Heading: "This page shipped to production without a spec."
  - Subtitle: "Happens to the best of us. Let's get you back on track."
  - CTA button: "Back to Home →" linking to index.html
  - Random PM quote (rotated via JS on page load):
    - "A good PM admits when they're lost — even on their own website."
    - "The best product decision is knowing which pages NOT to build."
    - "User retention starts with a working navigation."
  - CSS: shared only, minimal styling

**Checkpoint**: Contact page form validates and constructs mailto, FAQ accordion works. Now page renders with current info. 404 page shows with random quote and link home.

---

## Phase 7: Data Layer, SEO & Cross-Page Integration
> **Goal**: JSON data files, SEO meta for all pages, inter-page links verified, assets.

### Step 7.1: Data Files
- [ ] T040 Create `assets/data/projects.json` — Structured data for all 4 projects (slug, name, category, stack, oneLiner, metricValue, metricLabel, featured, caseStudyUrl)
- [ ] T041 Create `assets/data/blog-posts.json` — Structured data for all 3 blog posts (slug, title, date, category, readingTime, excerpt, featured, articleUrl)

### Step 7.2: SEO & Meta Tags
- [ ] T042 Add unique meta tags to every HTML page — title, description, OG title, OG description, OG type, OG image (placeholder), Twitter card, canonical URL, JSON-LD structured data (Person for home/about, Article for blog posts, SoftwareApplication for projects)

### Step 7.3: Cross-Page Wiring
- [ ] T043 Verify all internal links across all 14 pages — every `href` pointing to another page resolves correctly (relative paths). Create link inventory and test each.
- [ ] T044 Create `assets/resume/dhruv-singhal-resume.pdf` — Placeholder PDF (can be replaced later with real resume)
- [ ] T045 Update command palette items to include all pages, all case studies, and all blog articles
- [ ] T046 Add breadcrumb navigation to all inner pages (About, Projects, Case Studies, Blog, Articles, Contact, Now)

**Checkpoint**: All 14 pages have correct meta tags. All internal links work. Resume PDF downloads. Command palette can navigate to any page. Breadcrumbs show correct hierarchy on inner pages.

---

## Phase 8: Testing & Optimization
> **Goal**: Production-ready quality across all pages.

### Step 8.1: Accessibility
- [ ] T047 ARIA audit: all pages have proper landmarks (banner, main, contentinfo), all images have alt text, all form inputs have labels, all interactive elements have focus styles, skip-to-content link works on every page
- [ ] T048 Keyboard navigation pass: Tab through every page, verify focus order is logical, Escape closes all modals/overlays, Enter activates all buttons/links, FAQ accordion is keyboard accessible

### Step 8.2: Performance
- [ ] T049 Lighthouse audit per page — target Performance > 90, Accessibility > 95, Best Practices > 90, SEO > 90. Fix any flagged issues.
- [ ] T050 Verify page-specific JS/CSS loading — Home doesn't load blog.css, Blog doesn't load three-hero.js, etc. Check Network tab for each page.

### Step 8.3: Cross-Browser & Device
- [ ] T051 Test all pages on Chrome, Firefox, Safari (if available), Edge — theme toggle, animations, charts, 3D hero, form validation
- [ ] T052 Test all pages at breakpoints: 320px, 375px, 768px, 1024px, 1440px, 2560px — nav responsive, grids reflow, typography scales, touch targets ≥ 44px

### Step 8.4: Final QA
- [ ] T053 Reduced-motion pass: `prefers-reduced-motion: reduce` disables all animations, shows final states immediately, carousel stops auto-play, Three.js rotation stops
- [ ] T054 Print stylesheet pass: All pages print cleanly (hide nav, footer, cursor, scroll bar, show all content)
- [ ] T055 Console error pass: Zero errors on every page in both themes
- [ ] T056 Final link crawl: Visit every page, click every link, verify zero 404s for internal links

**Final Checkpoint**: All 14 pages pass Lighthouse > 90, zero console errors, all links work, both themes pixel-perfect, responsive at all breakpoints, keyboard navigable, reduced-motion supported, prints cleanly.

---

## Parallel Execution Map

```
Phase 1 (Foundation):
  Step 1.1: T001 ═══╗ T002 ═══╗ T003 ═══╗ T004 ═══╗ T005 ═══╗  (all parallel - CSS updates)
                     ║         ║         ║         ║         ║
  Step 1.2: T006 ═══╬═ T007 ══╬═ T008 ══╬═ T009 ══╬═ T010 ══╬═ T011 ══╗  (all parallel - new CSS)
                     ║         ║         ║         ║         ║         ║
  Step 1.3: T012 ───╬─ T013 ──╬─ T014 ──╬─ T015 ──╝         ║         ║  (sequential: app→cmd→scroll→transitions)
                     ║         ║                               ║         ║
  Step 1.4: T016 ═══╬═ T017 ══╝                               ║         ║  (parallel: delete old files)
                     ║                                         ║         ║
Phase 2 (Home):      ║                                         ║         ║
  T018 ──────────────╬──── T019 ═══╗ T020 ═══╝               ║         ║  (index.html → verify 3D + carousel)
                     ║             ║                           ║         ║
Phase 3 (About):     ║             ║                           ║         ║
  T021 ──────────── T022 ─────────╝                           ║         ║  (about.html → verify skills chart)
                                                               ║         ║
Phase 4 (Projects + Case Studies):                             ║         ║
  Step 4.1: T023 ── T024 ─────────────────────────────────────╝         ║  (projects.html + filters)
  Step 4.2: T025 ═══╗ T026 ═══╗ T027 ═══╗ T028 ═══╗                   ║  (all 4 case studies parallel)
                     ║         ║         ║         ║                     ║
  Step 4.3: T029 ───╝         ║         ║         ║                     ║  (charts module after 1 case study exists)
                               ║         ║         ║                     ║
Phase 5 (Blog):                ║         ║         ║                     ║
  Step 5.1: T030 ── T031 ─────╝         ║         ║                     ║  (blog.html + search)
  Step 5.2: T032 ═══╗ T033 ═══╗ T034 ══╝         ║                     ║  (all 3 articles parallel)
  Step 5.3: T035 ───╝                             ║                     ║  (reading progress after 1 article exists)
                                                   ║                     ║
Phase 6 (Contact + Now + 404):                     ║                     ║
  T036 ── T037 ═══╗ T038 ═══╗ T039 ═══╝           ║                     ║  (contact→form, now + 404 parallel)
                   ║         ║                       ║                     ║
Phase 7 (Data + SEO):         ║                       ║                     ║
  Step 7.1: T040 ═══╗ T041 ═╝                       ║                     ║  (JSON files parallel)
  Step 7.2: T042 ────────────────────────────────────╝                     ║  (SEO meta all pages)
  Step 7.3: T043 ── T044 ═══╗ T045 ── T046 ─────────────────────────────╝  (links → resume + cmd palette → breadcrumbs)
                             ║
Phase 8 (Testing):           ║
  Step 8.1: T047 ── T048 ───╝  (a11y audit → keyboard pass)
  Step 8.2: T049 ── T050       (lighthouse → js/css loading check)
  Step 8.3: T051 ── T052       (cross-browser → responsive)
  Step 8.4: T053 ═══╗ T054 ═══╗ T055 ═══╗ T056 ═══╗  (all parallel - final QA)
```

**Legend**: `═══` parallel, `───` sequential, `╗╬╝` dependency join

---

## Task Summary

| Phase | Tasks | New Files | Modified Files | Deleted Files |
|-------|-------|-----------|----------------|---------------|
| 1. Foundation | T001–T017 | 7 CSS, 1 JS | 5 CSS, 4 JS | 2 (sections.css, modal.js) |
| 2. Home | T018–T020 | 1 HTML | 2 JS | — |
| 3. About | T021–T022 | 1 HTML | 1 JS | — |
| 4. Projects + Cases | T023–T029 | 5 HTML, 2 JS | — | — |
| 5. Blog | T030–T035 | 4 HTML, 2 JS | — | — |
| 6. Contact + Now + 404 | T036–T039 | 3 HTML, 1 JS | — | — |
| 7. Data + SEO | T040–T046 | 3 data/assets | 14 HTML (meta) | — |
| 8. Testing | T047–T056 | — | (bug fixes) | — |
| **Total** | **56 tasks** | **14 HTML, 7 CSS, 6 JS, 3 data** | **Varies** | **2** |
