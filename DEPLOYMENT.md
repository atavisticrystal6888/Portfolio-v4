# Portfolio v4 — Deployment Guide

Production deployment to **Vercel**.

## Prerequisites

- Vercel account connected to the GitHub repository
- Resend account (for contact form email delivery)
- GitHub Personal Access Token (classic) with `read:user` and `public_repo` scopes — used for the GitHub GraphQL API on the Projects/About pages

## Environment Variables

Set these in **Vercel Project Settings → Environment Variables** for the
`Production`, `Preview`, and `Development` scopes as appropriate:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | No (graceful fallback) | GitHub GraphQL auth for pinned repos + contributions. Without it, the GitHub sections show cached/empty state. |
| `GITHUB_USERNAME` | No (graceful fallback) | Target GitHub user for the integration. |
| `RESEND_API_KEY` | No (graceful fallback) | Enables the `/api/contact` route to deliver email via Resend. Without it, submissions are logged server-side and return `200 OK`. |
| `CONTACT_EMAIL` | No | Destination address for contact form email. Defaults in code. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Used for canonical URLs, OG image URLs, and sitemap. Set to the production domain (e.g. `https://dhruvsinghal.com`). |

## First-time Deployment

1. Import the repository in Vercel (`vercel.com/new`).
2. Framework preset: **Next.js** (auto-detected).
3. Root Directory: `portfolio-v4`.
4. Build Command: `npm run build` (default).
5. Output: `.next` (default).
6. Add the environment variables above.
7. Deploy.

## Post-deployment Verification

Run these checks against the production URL:

```powershell
# 1. Page renders + status codes
curl -I https://your-domain.com/
curl -I https://your-domain.com/projects/aarkid

# 2. Sitemap and robots
curl https://your-domain.com/sitemap.xml
curl https://your-domain.com/robots.txt

# 3. Contact API rate-limit smoke test
curl -X POST https://your-domain.com/api/contact `
  -H "Content-Type: application/json" `
  -d '{"name":"Test","email":"t@t.com","subject":"Hi","message":"A reasonably long test message for validation."}'
```

Then in a browser:

- Open Chrome DevTools → Lighthouse → run against 5+ routes. Target scores:
  Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 95.
- Open an incognito window → paste the home URL into
  [Google Rich Results Test](https://search.google.com/test/rich-results)
  and the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- Verify OG previews show the dynamic `/og/[...slug]` image.

## ISR / Revalidation

- `getGitHubProfile()` uses `fetch(..., { next: { revalidate: 3600 } })`
  — GitHub data refreshes at most once per hour.
- Static pages are fully prerendered at build time.
- Dynamic routes (`/api/contact`, `/og/[...slug]`) run per request.

## Custom Domain

1. Add the domain under **Project → Settings → Domains**.
2. Update `NEXT_PUBLIC_SITE_URL` to the new canonical URL.
3. Trigger a redeploy so the sitemap and canonical tags pick up the new host.

## Local Quality Gates

Before shipping a change, run:

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Optional:

```powershell
npm run test:e2e      # Playwright E2E
npm run test:a11y     # axe-core accessibility
npm run lhci          # Lighthouse CI (requires @lhci/cli globally)
```
