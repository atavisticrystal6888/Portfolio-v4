# Quickstart: Portfolio v3 — Next.js

**Branch**: `portfolio-v3-nextjs` | **Date**: 2026-03-31

---

## Prerequisites

- **Node.js** 18.17+ (LTS recommended)
- **pnpm** 8+ (or npm 9+ / yarn 1.22+)
- **Git** 2.x
- **GitHub Personal Access Token** (for GitHub integration — `read:user` + `read:org` scopes)
- **Resend API Key** (for contact form — free at [resend.com](https://resend.com))

---

## 1. Initialize Project

```bash
# From repository root
npx create-next-app@latest portfolio-next --typescript --app --src-dir --no-tailwind --import-alias "@/*"
cd portfolio-next
```

## 2. Install Dependencies

```bash
# Core
pnpm add framer-motion @react-three/fiber @react-three/drei three
pnpm add react-chartjs-2 chart.js
pnpm add @next/mdx @mdx-js/loader @mdx-js/react gray-matter
pnpm add next-sitemap resend
pnpm add @vercel/analytics @vercel/speed-insights

# Dev
pnpm add -D @types/three @types/mdx
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test @axe-core/playwright
pnpm add -D lighthouse
```

## 3. Environment Variables

Create `.env.local` (gitignored):

```env
# GitHub Integration (ISR)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=DH40187606

# Contact Form (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=your-email@example.com

# Site URL (for canonical URLs, OG images, sitemap)
NEXT_PUBLIC_SITE_URL=https://dhruvsinghal.com
```

Create `.env.example` (committed):

```env
GITHUB_TOKEN=
GITHUB_USERNAME=
RESEND_API_KEY=
CONTACT_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Configure Next.js

`next.config.mjs`:
```javascript
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
```

## 5. Migrate Content

```bash
# Copy existing data files
cp ../portfolio/assets/data/projects.json content/projects.json
cp ../portfolio/assets/data/blog-posts.json content/blog-posts.json
cp ../portfolio/assets/resume/* public/resume/

# Create testimonials.json (extract from existing HTML)
# Create MDX files from existing HTML case studies and blog articles
```

## 6. Migrate CSS

```bash
# Copy global CSS (tokens, base, animations)
cp ../portfolio/css/tokens.css src/styles/tokens.css
cp ../portfolio/css/base.css src/styles/base.css
cp ../portfolio/css/animations.css src/styles/animations.css
```

Import in `src/app/globals.css`:
```css
@import '../styles/tokens.css';
@import '../styles/base.css';
@import '../styles/animations.css';
```

## 7. Self-Host Fonts

Download from Fontshare and place in `public/fonts/`:
- `satoshi-variable.woff2`
- `boska-variable.woff2`

Download JetBrains Mono from Google Fonts:
- `jetbrains-mono.woff2`

Add `@font-face` declarations to `src/styles/base.css` (replacing CDN imports).

## 8. Development

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build (SSG + ISR)
pnpm start        # Serve production build locally
pnpm lint         # ESLint check
```

## 9. Testing

```bash
pnpm vitest               # Unit tests (watch mode)
pnpm vitest run            # Unit tests (CI mode)
pnpm playwright test       # E2E tests
pnpm playwright test --ui  # E2E tests with UI
```

## 10. Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel                     # Preview deployment
vercel --prod              # Production deployment

# Or connect GitHub repo in Vercel dashboard for auto-deploy on push
```

### Vercel Environment Variables

Set in Vercel dashboard (Settings → Environment Variables):
- `GITHUB_TOKEN` — Production + Preview
- `GITHUB_USERNAME` — Production + Preview
- `RESEND_API_KEY` — Production only
- `CONTACT_EMAIL` — Production only
- `NEXT_PUBLIC_SITE_URL` — Production only (set to your domain)

---

## Key File Locations

| What | Where |
|------|-------|
| App routes | `src/app/` |
| React components | `src/components/` |
| Shared utilities | `src/lib/` |
| Custom hooks | `src/hooks/` |
| Global CSS | `src/styles/` |
| Component CSS | `*.module.css` next to component |
| TypeScript types | `src/types/` |
| Content (MDX/JSON) | `content/` |
| Static assets | `public/` |
| Tests | `tests/` |
| Spec documents | `specs/portfolio-v3/` |

---

## Route Map

| URL | File | Rendering |
|-----|------|-----------|
| `/` | `src/app/page.tsx` | SSG |
| `/about` | `src/app/about/page.tsx` | SSG + ISR (GitHub stats) |
| `/projects` | `src/app/projects/page.tsx` | SSG + ISR (GitHub repos) |
| `/projects/[slug]` | `src/app/projects/[slug]/page.tsx` | SSG (4 case studies) |
| `/blog` | `src/app/blog/page.tsx` | SSG |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | SSG (3 articles) |
| `/contact` | `src/app/contact/page.tsx` | SSG |
| `/now` | `src/app/now/page.tsx` | SSG |
| `/api/contact` | `src/app/api/contact/route.ts` | Serverless |
| `/sitemap.xml` | `src/app/sitemap.ts` | Build-time |
| `404` | `src/app/not-found.tsx` | SSG |
