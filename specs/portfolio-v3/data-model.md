# Data Model: Portfolio v3

**Branch**: `portfolio-v3-nextjs` | **Date**: 2026-03-31  
**Source**: `specs/portfolio-v3/spec.md` Key Entities section

---

## Entity Definitions

### Project

The core portfolio content unit. Represents a body of work with measurable outcomes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | URL-safe identifier (e.g., `"aarkid"`) — unique, used in routing |
| `name` | string | ✅ | Display name (e.g., `"Aarkid — Flora Monitoring Platform"`) |
| `category` | `"product" \| "data" \| "ai" \| "technical"` | ✅ | Filter category |
| `description` | string | ✅ | Short description (1-2 sentences) |
| `stack` | string[] | ✅ | Technology tags (e.g., `["Gemini Pro", "Python", "LangChain"]`) |
| `metricValue` | string | ✅ | Primary outcome metric display value (e.g., `"15%"`, `"10×"`) |
| `metricLabel` | string | ✅ | Metric description (e.g., `"Churn Reduction"`) |
| `featured` | boolean | ✅ | Whether to show on Home page featured section |
| `githubUrl` | string \| null | ❌ | GitHub repository URL (for GitHub integration linking) |
| `duration` | string | ✅ | Project duration (e.g., `"Jan 2026 – Mar 2026"`) |
| `role` | string | ✅ | Role in project (e.g., `"Product Manager & Technical Lead"`) |
| `order` | number | ✅ | Display order in project grid and circular prev/next navigation |

**Source file**: `content/projects.json`  
**Uniqueness**: `slug` must be unique across all projects  
**Relationships**: One-to-one with CaseStudy (via matching slug), one-to-many with Testimonial (via `projectSlug`)

---

### CaseStudy

Extended content for a project, authored in MDX with structured frontmatter.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | Must match a Project.slug |
| `title` | string | ✅ | Case study title |
| `subtitle` | string | ✅ | Brief tagline |
| `role` | string | ✅ | Role in the project |
| `duration` | string | ✅ | Time span |
| `stack` | string[] | ✅ | Technologies used |
| `tldr` | string | ✅ | 2-sentence summary with metric highlight |
| `metrics` | CaseStudyMetric[] | ✅ | Array of outcome metrics for Chart.js visualization |
| `prevSlug` | string | ✅ | Previous case study slug (circular nav) |
| `nextSlug` | string | ✅ | Next case study slug (circular nav) |

**CaseStudyMetric**:
| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Metric name (e.g., `"Churn Reduction"`) |
| `value` | number | Numeric value for chart |
| `displayValue` | string | Formatted display (e.g., `"~15%"`) |
| `chartType` | `"bar" \| "doughnut" \| "line"` | Chart.js visualization type |

**Source file**: `content/case-studies/[slug].mdx` (frontmatter + MDX body)  
**Circular navigation order**: aarkid → churn-analysis → marketing-effectiveness → portfolio-site → aarkid  
**Relationships**: One-to-one with Project (slug match)

---

### BlogArticle

Thought leadership content, authored in MDX.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | URL-safe identifier |
| `title` | string | ✅ | Article title |
| `date` | string (ISO 8601) | ✅ | Publication date (e.g., `"2026-03-28"`) |
| `updatedDate` | string (ISO 8601) \| null | ❌ | Last updated date (for sitemap `lastmod`) |
| `category` | `"Product" \| "Data" \| "Career"` | ✅ | Article category |
| `tags` | string[] | ✅ | Content tags for suggestion scoring and related articles |
| `readingTime` | string | ✅ | Estimated reading time (e.g., `"6 min read"`) |
| `excerpt` | string | ✅ | Article excerpt for listing cards and meta description (≤160 chars) |
| `socialImage` | string \| null | ❌ | Path to article-specific OG image |

**Source file**: `content/blog/[slug].mdx` (frontmatter + MDX body)  
**Uniqueness**: `slug` must be unique across all articles  
**Relationships**: Many-to-many with BlogArticle (via tags, for "Related articles" scoring)

---

### Testimonial

Social proof linked to a specific project with quantifiable outcome.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Recommender's name |
| `title` | string | ✅ | Recommender's job title |
| `company` | string | ✅ | Recommender's company |
| `quote` | string | ✅ | Testimonial text |
| `avatar` | string \| null | ❌ | Path to avatar image (fallback: initials) |
| `projectSlug` | string | ✅ | References Project.slug — links to relevant case study |
| `outcomeMetric` | object | ✅ | `{ value: string, label: string }` — e.g., `{ value: "10×", label: "Lead Generation" }` |
| `relationship` | string | ✅ | Context (e.g., `"Manager at Wipro"`, `"Co-founder at Odena"`) |

**Source file**: `content/testimonials.json`  
**Validation**: `projectSlug` must reference a valid Project.slug  
**Validation**: `outcomeMetric` values must match the linked case study's CaseStudyMetric (single source of truth enforcement)

---

### GitHubProfile

Fetched at build time / ISR from GitHub GraphQL API. Not stored as a content file.

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | GitHub username |
| `pinnedRepos` | PinnedRepo[] | Pinned repository data |
| `contributionCalendar` | object | Heatmap data (weeks × days with contribution counts) |
| `totalContributions` | number | Total contributions this year |
| `topLanguages` | { name: string, percentage: number }[] | Top 5 languages by usage |
| `currentStreak` | number | Current consecutive-day contribution streak |
| `totalPublicRepos` | number | Number of public repositories |
| `fetchedAt` | string (ISO 8601) | Timestamp of last successful fetch |

**PinnedRepo**:
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Repository name |
| `description` | string \| null | Repository description |
| `url` | string | GitHub URL |
| `primaryLanguage` | string \| null | Primary language |
| `stargazerCount` | number | Star count |
| `forkCount` | number | Fork count |
| `matchedProjectSlug` | string \| null | If matches a portfolio project, link to case study |

**Source**: GitHub GraphQL API via `src/lib/github.ts`  
**Caching**: ISR with `revalidate: 3600` (1 hour)  
**Fallback**: Last cached response if API fails

---

### ThemeConfig

Client-side user preference stored in localStorage. Not a server-side entity.

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `"dark" \| "light"` | Color scheme mode |
| `palette` | `"teal" \| "ocean" \| "emerald" \| "amber" \| "mono"` | Accent color palette |

**Storage**: `localStorage.setItem('ds-portfolio-theme', JSON.stringify(config))`  
**Default**: `{ mode: "dark", palette: "teal" }` (falls back to `prefers-color-scheme` for mode)  
**Application**: Inline `<script>` in root layout reads before first paint → sets `data-theme` and `data-palette` on `<html>`

---

### UserBehavior

Client-side behavioral data for AI-powered suggestions. Stored in localStorage.

| Field | Type | Description |
|-------|------|-------------|
| `pagesVisited` | { slug: string, timestamp: number }[] | Ordered list of page visits |
| `categoryAffinities` | Record<string, number> | Category → visit count mapping (e.g., `{ "data": 3, "product": 1 }`) |
| `sectionScrollDepths` | Record<string, number> | Page slug → max scroll depth (0-1) |
| `sessionCount` | number | Number of distinct sessions |
| `firstVisit` | number | Unix timestamp of first visit |
| `lastVisit` | number | Unix timestamp of last visit |

**Storage**: `localStorage.setItem('ds-portfolio-behavior', JSON.stringify(data))`  
**Lifecycle**:
- Created on first page load (cold start: empty arrays, zero counts)
- Updated on every page navigation and scroll event (debounced 500ms for scroll)
- Read by `src/lib/suggestions.ts` to compute content relevance scores
- Cleared when user clears browser data (graceful fallback to default suggestions)
- No expiration — persists indefinitely in localStorage

**Privacy**: No PII collected, no server-side transmission, no cookies. All data stays on-device.

---

## Entity Relationship Diagram

```
┌────────────┐     1:1 (slug)     ┌──────────────┐
│  Project    │◄──────────────────►│  CaseStudy   │
│  (.json)    │                    │  (.mdx)      │
└──────┬──────┘                    └──────────────┘
       │ 1:N (projectSlug)
       ▼
┌────────────┐
│ Testimonial│
│  (.json)   │
└────────────┘

┌────────────┐     tags overlap    ┌──────────────┐
│BlogArticle │◄- - - - - - - - - -►│ BlogArticle  │
│  (.mdx)    │   (related scoring) │  (.mdx)      │
└────────────┘                     └──────────────┘

┌────────────┐    matchedProjectSlug  ┌────────────┐
│ PinnedRepo │- - - - - - - - - - - -►│  Project    │
│ (API resp) │    (optional link)     │  (.json)    │
└────────────┘                        └────────────┘

┌────────────┐                     ┌──────────────┐
│ThemeConfig │  (localStorage)     │ UserBehavior │  (localStorage)
│ (client)   │                     │ (client)     │
└────────────┘                     └──────────────┘
```

---

## Data Validation Rules

1. **Slug uniqueness**: All Project slugs must be unique. All BlogArticle slugs must be unique. Slugs must be URL-safe (`[a-z0-9-]+`).
2. **Referential integrity**: `Testimonial.projectSlug` must match an existing `Project.slug`. `CaseStudy.slug` must match an existing `Project.slug`.
3. **Metric consistency**: `Testimonial.outcomeMetric` must match a metric in the linked CaseStudy's `metrics` array (single source of truth).
4. **Circular nav completeness**: Every CaseStudy `prevSlug` and `nextSlug` must reference valid CaseStudy slugs, forming a complete cycle.
5. **Date format**: All dates must be valid ISO 8601 strings (`YYYY-MM-DD`).
6. **Excerpt length**: `BlogArticle.excerpt` must be ≤160 characters (for meta description).
