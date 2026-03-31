# Feature Specification: Dhruv Singhal Portfolio v3 — Multi-Page

**Created**: 2026-03-31  
**Updated**: 2026-03-31  
**Status**: Approved  
**Input**: Multi-page enterprise portfolio for Product Manager/Builder. Inspired by odena.io, top PM portfolios, and developer portfolio best practices.

## User Scenarios & Testing

### User Story 1 — First Impression & Hub Navigation (Priority: P1)
A recruiter/hiring manager lands on the home page. Within 3 seconds they see: a cinematic 3D particle hero, Dhruv's name with animated typing roles, key metrics animating in, and clear CTAs to explore deeper. The home page acts as a **hub**, not a destination — every section teases content with "Read more →" links to dedicated pages.

**Acceptance Scenarios**:
1. **Given** home page loads, **When** assets ready, **Then** loading screen fades, particles render, name animates
2. **Given** home page visible, **When** user clicks "Read Case Study", **Then** navigates to dedicated case study page with page transition
3. **Given** any page, **When** nav clicked, **Then** active page highlighted, smooth page transition

### User Story 2 — Cross-Page Navigation (Priority: P1)
User can navigate between all pages via the nav bar, command palette (Ctrl+K), breadcrumbs, and internal links. Navigation feels cohesive with page transitions.

**Acceptance Scenarios**:
1. **Given** any page, **When** Ctrl+K pressed, **Then** command palette shows all pages, case studies, and blog articles
2. **Given** inner page (e.g., case study), **When** breadcrumb "Projects" clicked, **Then** navigates to projects.html
3. **Given** link clicked, **When** navigating between pages, **Then** exit animation → navigate → entry animation

### User Story 3 — Case Study Deep Dive (Priority: P1)
User navigates to a project case study page. They see the full story: structured problem→research→solution→outcome with metric visualizations, code snippets, and diagrams. Each case study is a dedicated page, not a modal.

**Acceptance Scenarios**:
1. **Given** case study page loads, **When** scrolling, **Then** reading progress bar fills, sections animate in
2. **Given** metrics section, **When** visible, **Then** Chart.js visualization draws with animation
3. **Given** bottom of case study, **When** visible, **Then** prev/next navigation links to adjacent case studies

### User Story 4 — Project Gallery & Filtering (Priority: P1)
User visits the projects page. They see all projects in a filterable grid. They can filter by category (Product, Data, AI, Technical) and each card links to its case study.

**Acceptance Scenarios**:
1. **Given** projects page, **When** "AI" filter clicked, **Then** only AI projects shown with animated reflow
2. **Given** project card, **When** hovered, **Then** 3D tilt + glow effect
3. **Given** project card, **When** "Read Case Study" clicked, **Then** navigates to case study page

### User Story 5 — About & Skills Dashboard (Priority: P1)
User visits the about page. They see comprehensive bio, product philosophy, interactive skills radar, detailed experience timeline, achievements, and resume download.

**Acceptance Scenarios**:
1. **Given** about page, **When** skills section visible, **Then** radar chart animates with two datasets
2. **Given** about page, **When** "Download Resume" clicked, **Then** PDF downloads
3. **Given** about page, **When** experience timeline visible, **Then** items animate in with stagger

### User Story 6 — Blog & Thought Leadership (Priority: P2)
User visits the blog page. They see article cards with search and category filtering. Clicking an article opens a full article page with rich typography, TOC, and reading progress.

**Acceptance Scenarios**:
1. **Given** blog page, **When** user types in search, **Then** articles filter in real-time
2. **Given** article page, **When** scrolling, **Then** reading progress bar fills, TOC highlights current section
3. **Given** article page, **When** code block visible, **Then** syntax highlighted by Prism.js

### User Story 7 — Theme Consistency Across Pages (Priority: P2)
Dark/Light theme toggle persists across all page navigations. Every page renders correctly in both themes.

**Acceptance Scenarios**:
1. **Given** dark mode on home, **When** navigating to about, **Then** about page is also dark
2. **Given** theme toggled on contact page, **When** navigating to blog, **Then** blog page uses new theme

### User Story 8 — Contact & Outreach (Priority: P2)
User visits the contact page. They see availability status, a contact form, direct links, and FAQ.

**Acceptance Scenarios**:
1. **Given** contact form, **When** submitted with valid data, **Then** mailto: link opens with pre-filled content
2. **Given** FAQ section, **When** question clicked, **Then** answer expands with smooth animation
3. **Given** email link, **When** clicked, **Then** copied to clipboard with toast notification

### User Story 9 — /Now Page (Priority: P3)
User visits the /now page to see what Dhruv is currently focused on.

### User Story 10 — 404 Page (Priority: P3)
User lands on a non-existent page. They see a charming error page with a PM-themed message and link home.

### User Story 11 — Testimonials (Priority: P3)
Home page has auto-scrolling carousel of recommendations.

## Requirements

### Functional Requirements
- **FR-001**: Multi-page architecture with 14 HTML pages and shared layout
- **FR-002**: 3D particle hero with Three.js on home page
- **FR-003**: GSAP ScrollTrigger for page-aware animations on all pages
- **FR-004**: Cross-page command palette (Ctrl+K / Cmd+K) with fuzzy search
- **FR-005**: Dedicated case study pages with structured PM format (4 projects)
- **FR-006**: Case study metric visualizations with Chart.js
- **FR-007**: Project gallery page with category filtering and animated reflow
- **FR-008**: Blog listing page with search and category filters
- **FR-009**: Blog article pages with reading progress bar, TOC, and Prism.js code highlighting
- **FR-010**: About page with interactive skills radar chart
- **FR-011**: About page with detailed experience timeline and achievements
- **FR-012**: Contact page with form, FAQ accordion, and availability status
- **FR-013**: Theme toggle persisting across page navigations (localStorage)
- **FR-014**: Scroll progress indicator on all pages
- **FR-015**: Custom cursor with magnetic effect on all pages
- **FR-016**: Smooth page transitions between internal pages
- **FR-017**: Breadcrumb navigation on inner pages
- **FR-018**: Animated metric counters with easing
- **FR-019**: Toast notification system
- **FR-020**: Testimonial carousel on home page
- **FR-021**: Loading screen with progress on home page
- **FR-022**: Mobile hamburger with full-screen overlay
- **FR-023**: Copy-to-clipboard on email
- **FR-024**: Downloadable resume PDF
- **FR-025**: /Now page with current focus areas
- **FR-026**: 404 page with personality and link home
- **FR-027**: Keyboard navigation (Tab, Escape, Ctrl+K, arrows in carousel/palette)
- **FR-028**: tsParticles ambient background on home page
- **FR-029**: Mermaid.js diagrams in case studies
- **FR-030**: Prev/next navigation between case studies and blog articles

### Non-Functional Requirements
- **NFR-001**: Multi-page static site (14 HTML + 11 CSS + 17 JS), zero build tools, CDN-only deps
- **NFR-002**: < 2.5s LCP per page on 4G
- **NFR-003**: Lighthouse > 90 on all four scores for every page
- **NFR-004**: WCAG 2.1 AA color contrast on all pages
- **NFR-005**: Graceful degradation without JS on all pages (content visible)
- **NFR-006**: Reduced-motion support on all pages
- **NFR-007**: Works with file:// protocol and any static host
- **NFR-008**: Page-specific CSS/JS loading (home doesn't load blog.css, etc.)
- **NFR-009**: Zero broken internal links across all 14 pages
- **NFR-010**: Print-friendly stylesheet for all pages
