# ExperimentHub integration — design

**Date:** 2026-10-07 · **Status:** approved (owner chose "portfolio instead of
a demo storefront"; execution autonomous) · **Sub-project 2 of 2**, following
the JavaScript SDK (`A-B-Testing-Platform/docs/superpowers/specs/2026-10-07-javascript-sdk-design.md`).

## 1. Problem

The ExperimentHub case study on this site says its evidence "comes from a
synthetic demo tenant, not production use." The platform has a real SDK now
but no real consumer. This site is a real application with a real outcome
(someone reads a case study and gets in touch), so it can be the platform's
first non-synthetic tenant — and the integration must not put the
just-launched site at risk: no behaviour change and no new latency until the
platform is actually reachable.

## 2. Goal

Run one A/B test on the home-page hero's primary call-to-action through
`@experiment-hub/sdk`, with server-side assignment, an anonymous first-party
identity cookie for stickiness, a click conversion from the CTA and a
form-submit conversion from `/contact` — all **fail-open and dormant** until
two environment variables are set.

## 3. Non-goals

- Hosting ExperimentHub. Production stays dormant until the platform has a
  public URL; nothing here changes when that happens except two env vars.
- Any client-side assignment, flicker handling, or flag evaluation.
- A consent banner. The cookie is a random opaque id with no PII, set only
  when experiments are enabled, and the site already runs Vercel Analytics.
- Reporting results in the case study. Only a truthful "wired, dormant until
  hosted" note is added; numbers come later.
- Touching the three files another session has modified in the main
  checkout (`MetricCounter.*`, `lib/utils.ts`).

## 4. Enablement and environment

| Variable | Scope | Purpose |
|---|---|---|
| `EXPERIMENTHUB_API_URL` | server | Origin of the platform API, e.g. `http://127.0.0.1:4000` |
| `EXPERIMENTHUB_API_KEY` | server | Tenant SDK key (`eh_live_…`). Never `NEXT_PUBLIC_`. |

`isExperimentsEnabled()` ⇔ both are non-empty strings. When disabled:
no cookie is set, no header is injected, the home page stays **statically
prerendered** (it must not call `cookies()`/`headers()` on that path), the
CTA renders the control copy as a plain link with no client JavaScript, the
track route answers `204`, and the contact route behaves byte-for-byte as
today. CI runs with all env unset and must stay green on that path.

Enabling makes `/` dynamically rendered (it reads request headers). That is
the documented cost of running the experiment, recorded in DEPLOYMENT.md.

Both variables are added to `.env.example` and the DEPLOYMENT.md table in
the repo's existing style (SCREAMING_SNAKE, optional, graceful fallback).

## 5. Identity

- Cookie `eh_uid`: UUID v4 from `crypto.randomUUID()`, `HttpOnly`,
  `SameSite=Lax`, `Path=/`, `Max-Age=31536000`, `Secure` when the request is
  https. Set by `src/proxy.ts` **only when enabled** and only when absent.
- The proxy always injects request header `x-eh-uid` (from the cookie or the
  freshly generated id) via `NextResponse.next({ request: { headers } })`,
  overwriting any incoming value so a client cannot forge it. Server
  components read it with `(await headers()).get("x-eh-uid")`; route handlers
  read `request.cookies.get("eh_uid")?.value ?? request.headers.get("x-eh-uid")`.
- The `www` → apex redirect branch in the proxy returns before any of this.
- `src/lib/experiments/identity.ts` owns the names and the cookie options so
  the proxy, the page and the routes cannot drift.

## 6. The experiment

| | |
|---|---|
| Key | `portfolio-hero-cta` |
| Surface | `src/components/home/HeroSection.tsx` primary CTA (today `<Button href="#work">See the work</Button>`) |
| Control `control` | "See the work" (unchanged) |
| Treatment `read-the-case-studies` | "Read the case studies" |
| Split | 50 / 50 (basis points 5000 / 5000) |
| Feature tag | `home-hero` |
| Primary metric | `hero_cta_click` — conversion; event fires once per user on CTA click |
| Secondary metric | `contact_submitted` — conversion; fires on a genuine `/api/contact` success |

The hero headline, status line and secondary CTA do not change. Variant →
copy lives in one place, `src/lib/experiments/hero.ts`
(`HERO_CTA_COPY: Record<HeroCtaVariant, string>`; unknown variant keys map to
control so a renamed variant on the server can never render an empty button).

Metric definitions mirror the platform's seeded, working shape:
`metric_type: "ratio"`, `definition: { event_name, numerator: "conversion",
denominator: "assignment" }`.

## 7. Request flow

```
GET /  (enabled)
  proxy: eh_uid cookie (set if absent) → x-eh-uid request header
  page.tsx: uid = headers().get("x-eh-uid")
            a = await assignOrControl(uid, "portfolio-hero-cta")   # ≤300 ms, fail-open
            <HeroSection ctaVariant={a.variantKey} tracked={a.enrolled} />
  HeroSection: tracked ? <HeroCtaLink/> (client; onClick → beacon) : <Button/>

click CTA (enabled, enrolled)
  HeroCtaLink: fetch("/api/experiments/track", { method:"POST", keepalive:true,
               body: {"event":"hero_cta_click"} })  — not awaited
  route: uid from cookie/header; if disabled or no uid → 204
         a = assignOrControl(uid, key)  (sticky, same variant)
         if !a.enrolled → 204
         track({ userId: uid, experimentId: a.experimentId, variantId: a.variantId,
                 type:"conversion", name:"hero_cta_click",
                 idempotencyKey: `${uid}:portfolio-hero-cta:hero_cta_click` })
         → always 204 (never an oracle; errors logged with a fixed label)

POST /api/contact success (line `return NextResponse.json(SUCCESS_BODY)` after a real send)
  await trackContactSubmission(request)   # ≤1 s total, fail-open; NOT on the honeypot path
```

`idempotencyKey` is derived from `uid + experiment + event`, so repeated
clicks or re-submits count once per user — the platform dedupes on it.

## 8. The experiments library (`src/lib/experiments/`)

| File | Exports | Notes |
|---|---|---|
| `config.ts` | `isExperimentsEnabled()`, `getExperimentsConfig()` | reads `process.env` at call time |
| `identity.ts` | `UID_COOKIE = "eh_uid"`, `UID_HEADER = "x-eh-uid"`, `newUid()`, `uidCookieOptions(secure)` , `readUid(request)` | |
| `client.ts` | `createExperimentsClient({ fetch? })`, `assignOrControl(uid, experimentKey, opts?)`, `trackConversion(uid, experimentKey, eventName, opts?)` | the only module that imports `@experiment-hub/sdk`; `fetch` injectable for tests |
| `hero.ts` | `HERO_CTA_EXPERIMENT = "portfolio-hero-cta"`, `HeroCtaVariant`, `HERO_CTA_COPY`, `heroCtaCopy(variantKey)` | |

**Fail-open contract of `assignOrControl`:**

| Situation | Result | Log |
|---|---|---|
| disabled | `{ variantKey:"control", enrolled:false }` without any network call | none |
| `NetworkError` (timeout 300 ms, DNS, refused), `ServiceUnavailableError`, `RateLimitError` | control, `enrolled:false` | `console.warn("[experiments] assign unavailable: <code>")` — code only, never the key or uid |
| `AuthenticationError`, `NotFoundError`, `ValidationError`, `ApiError` (misconfiguration) | control, `enrolled:false` | `console.error("[experiments] assign misconfigured: <code> <status>")` |
| success | the SDK `Assignment` | none |

A home page must never 500 because of an experiment; "loud" here means an
error-level log line with a fixed label, matching the contact route's
bounded-logging convention (never log payloads).

`trackConversion` has the same contract with a 500 ms budget per request (assign + track ≤ 1 s) and returns
`void`; it is a no-op when disabled or when the assignment says
`enrolled:false` (the SDK spec: never track un-enrolled users — the rollup
has no assignment join).

## 9. Dependency vendoring

The SDK is not on npm and a `file:../A-B-Testing-Platform/...` path does
not exist on Vercel. The built package is committed as
`vendor/experiment-hub-sdk-0.1.0.tgz` (produced by `npm pack` in
`A-B-Testing-Platform/sdk/javascript`) and referenced as
`"@experiment-hub/sdk": "file:vendor/experiment-hub-sdk-0.1.0.tgz"`. The
lockfile pins its integrity, `npm ci` works offline, and refreshing it is a
documented two-command step in DEPLOYMENT.md.

## 10. Platform setup script

`scripts/experiment-hub-setup.mjs` (Node 20, `fetch` only, no deps) creates
what the experiment needs on a platform instance, idempotently:

1. `POST /api/v1/auth/login` with `EXPERIMENTHUB_ADMIN_EMAIL` /
   `EXPERIMENTHUB_ADMIN_PASSWORD` (defaults to the platform's `mix dev.demo`
   admin **only when the URL is a loopback address**; otherwise required).
2. `GET /api/v1/metric-definitions`; create `hero_cta_click` and
   `contact_submitted` if missing.
3. `GET /api/v1/experiments`; create `portfolio-hero-cta` if missing with the
   two variants; attach metrics (`primary`, `secondary`); `POST …/start` if
   status is `draft`.
4. Print the experiment id, status, and a reminder of the two env vars.

It is a dev/ops tool, documented in DEPLOYMENT.md under "Experiments".

## 11. Site copy

`content/case-studies/experiment-hub.mdx`, section "Limits and next": the
bullet "**No production tenant.** …" becomes a truthful statement that this
site's home-page CTA is wired through the JavaScript SDK (link to the SDK
README on GitHub), fail-open and dormant until the platform is hosted, and
that the first real results will replace the seed numbers. The tldr,
metaDescription (locked by `tests/unit/case-study-frontmatter.test.ts` to
match `/demo data/i`), metrics labels and the synthetic-run artifacts stay
exactly as they are — they describe the seed run, which is still what the
numbers show.

## 12. Tests

Unit (vitest, `node` environment, `tests/unit/*.test.ts`, repo style:
explicit imports, `vi.stubEnv`, `vi.resetModules`, dynamic import of the
module under test):

- `experiments-config.test.ts` — enabled iff both vars set; whitespace-only counts as unset.
- `experiments-client.test.ts` — disabled → no fetch call; injected fetch
  that rejects → control/`enrolled:false` + one `console.warn`; 401 body →
  control + one `console.error`; success maps through; `trackConversion`
  skips when `enrolled:false`, sends `experiment_id`/`variant_id`/
  idempotency key when enrolled; 300 ms / 1000 ms budgets are passed to the SDK.
- `experiments-identity.test.ts` — cookie options, `readUid` precedence
  (cookie over header), `newUid` format.
- `proxy.test.ts` — with env set: response has a `Set-Cookie: eh_uid=…;
  HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000` and the forwarded request
  carries `x-eh-uid` equal to it; incoming `x-eh-uid` is overwritten; with an
  existing cookie no `Set-Cookie`; with env unset neither cookie nor header;
  existing security headers and CSP unchanged.
- `experiments-track-route.test.ts` — 204 when disabled; 204 without uid;
  400 on unknown event name or bad JSON; enabled + enrolled → SDK `track`
  called with the derived idempotency key, still 204; SDK failure → 204.
- `contact.test.ts` (extend) — honeypot path never tracks; genuine success
  tracks once with `contact_submitted`; tracking failure does not change the
  response; existing ordering tests untouched.
- `hero.test.ts` — copy map, unknown variant → control copy.

E2E (Playwright, env unset, as CI runs it): `tests/e2e/home.spec.ts` gains
assertions that the hero CTA reads "See the work" and that the document
response sets no `eh_uid` cookie.

Live verification (manual, recorded in DEPLOYMENT.md "Verified locally"):
with the local stack and `scripts/experiment-hub-setup.mjs` run, `next build
&& next start` with the two env vars; `curl -i /` shows `Set-Cookie: eh_uid`
and one of the two CTA copies; the same cookie on a second request gives the
same copy; a `POST /api/experiments/track` with that cookie returns 204 and
the platform's `/api/v1/experiments/:id/results` (or the dashboard) shows
the assignment and the event.

## 13. Verification gates (repo's own)

`npm run guard:case-studies`, `npm run lint`, `npx tsc --noEmit`, `npm test`,
`npm run build`, then `npm run test:e2e -- --project=chromium` for
`home.spec.ts` and `contact.spec.ts`. Lighthouse budget is unaffected on the
disabled path because `/` remains static; this is asserted by `next build`'s
route table showing `/` as static (○) in the build output.

## 14. Decisions taken during design (rulings)

- **Branch-and-commit in this repo is allowed; push/deploy are not.** No
  repo rule forbids agent commits; past practice is feature branches with
  explicit-path commits. Owner merges.
- **Surface = hero CTA, primary metric = CTA click, secondary = contact
  submit.** The hero does not link to the contact form (its "Email me" is a
  `mailto:`), so a CTA experiment measured only by contact submits would
  have no causal path; the click is the honest primary, the submit the
  business outcome.
- **Honeypot submissions never count.** The route returns an identical body
  on the honeypot path by design; the conversion hook attaches only to the
  genuine-send return.
- **Static home page preserved when disabled** — enabling the experiment is
  what makes `/` dynamic, and that is documented rather than hidden.
- **`Button` forwards `onClick` for link renders.** Today it destructures
  `onClick` and drops it for `href` buttons; the tracked CTA needs it. One
  line each for `<Link>` and `<a>`.
- **No `NEXT_PUBLIC_` anything.** The API key never reaches the browser; the
  browser only ever talks to `/api/experiments/track` on the same origin,
  which the existing CSP (`connect-src 'self'`) already allows.
