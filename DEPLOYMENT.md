# Portfolio Deployment Guide

Production deployment to **Vercel** for the root Next.js app in this repository.

## Prerequisites

- Vercel account connected to the GitHub repository
- Resend account (for contact form email delivery)
- GitHub Personal Access Token (classic) with `read:user` and `public_repo` scopes - used for the GitHub GraphQL API on the Projects/About pages

## Environment Variables

Set these in **Vercel Project Settings → Environment Variables** for the
`Production`, `Preview`, and `Development` scopes as appropriate:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | No (graceful fallback) | GitHub GraphQL auth for pinned repos + contributions. Without it, the GitHub sections show cached/empty state. |
| `GITHUB_USERNAME` | No (graceful fallback) | Target GitHub user for the integration. |
| `RESEND_API_KEY` | No (graceful fallback) | Enables the `/api/contact` route to deliver email via Resend. Without it, submissions are logged server-side and the route returns `200 OK` in development and `503` in production builds. |
| `CONTACT_EMAIL` | No | Destination address for contact form email. Defaults in code. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Used for canonical URLs, OG image URLs, and sitemap. Set to the production domain (e.g. `https://dhruvsinghal.com`). |
| `EXPERIMENTHUB_API_URL` | No (dormant when unset) | Origin of the ExperimentHub API (e.g. `https://hub.example.com`). With `EXPERIMENTHUB_API_KEY`, enables the home-page CTA experiment and makes `/` dynamically rendered. |
| `EXPERIMENTHUB_API_KEY` | No (dormant when unset) | Tenant SDK key (`eh_live_…`). Server-only; never exposed to the browser. |

## Experiments (ExperimentHub)

The home-page hero CTA can run as an A/B test through
[ExperimentHub](https://github.com/atavisticrystal6888/A-B-Testing-Platform)
using its JavaScript SDK (vendored as `vendor/experiment-hub-sdk-<version>.tgz`).
It is **dormant until both `EXPERIMENTHUB_API_URL` and `EXPERIMENTHUB_API_KEY`
are set**: no cookie, no requests, `/` stays static. With both set:

- the proxy gives each browser an anonymous `eh_uid` cookie (HttpOnly, SameSite=Lax, 1 year, no PII);
- `/` is rendered per request and asks the platform which variant to show (300 ms budget, then control);
- CTA clicks beacon to `/api/experiments/track` on this origin; genuine contact submissions count as `contact_submitted`;
- every failure is fail-open: the platform being down never changes what the site shows.

One-time platform setup (creates the metrics and the `portfolio-hero-cta` experiment, idempotent):

```bash
EXPERIMENTHUB_API_URL=http://127.0.0.1:4000 node scripts/experiment-hub-setup.mjs
```

Refreshing the vendored SDK after a platform release:

```bash
(cd ../A-B-Testing-Platform/sdk/javascript && npm run build && npm pack)   # → experiment-hub-sdk-<v>.tgz
cp ../A-B-Testing-Platform/sdk/javascript/experiment-hub-sdk-<v>.tgz vendor/
npm install ./vendor/experiment-hub-sdk-<v>.tgz --save
```

**Verified locally (2026-10-07):** against ExperimentHub at `127.0.0.1:4000` - cookie minted, variant served and sticky across repeat requests and matching the platform's assignment (`enrolled: true`), CTA beacon returned 204, contact submit returned `ok` in a non-production run; with the variables unset the site served control, set no cookie, and `/` built static. The platform's results/analysis endpoints did not yet show the `hero_cta_click` / `contact_submitted` events at the time of the check. Set both variables at **build time** as well as runtime: a build made without them prerenders `/` statically and ignores them later. A production build with no `RESEND_API_KEY` answers `/api/contact` with 503 by design.

**Before enabling in production:** the track route has no rate limit yet (reuse the contact route's IP limiter), and contact conversions will assign visitors who never saw the hero; address both before setting the env vars.

## First-time Deployment

1. Import the repository in Vercel (`vercel.com/new`).
2. Framework preset: **Next.js** (auto-detected).
3. Root Directory: leave blank / use the repository root (`.`).
4. Build Command: `npm run build` (default).
5. Output: `.next` (default).
6. Add the environment variables above.
7. Deploy.

`portfolio-v4/` exists in this workspace only as an ignored legacy folder and should not be used as the Vercel root.

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
  - GitHub data refreshes at most once per hour.
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
