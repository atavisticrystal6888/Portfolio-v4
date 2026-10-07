# ExperimentHub Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run one fail-open A/B test on the home-page hero CTA through `@experiment-hub/sdk`, with server-side assignment, an anonymous `eh_uid` cookie, a CTA-click conversion and a contact-submit conversion — dormant until two env vars are set.

**Architecture:** A small `src/lib/experiments/` library (config, identity, client wrapper with fail-open, hero copy map) is the only code that knows about the SDK. The proxy mints the cookie and injects `x-eh-uid`; `page.tsx` assigns server-side only when enabled (so `/` stays static otherwise); a client `HeroCtaLink` beacons clicks to a same-origin route; the contact route tracks genuine sends. The SDK is vendored as a committed tarball.

**Tech Stack:** Next.js 16.2 (App Router, `src/proxy.ts` middleware), React 19, TypeScript strict + `noUncheckedIndexedAccess`, vitest (node env), Playwright, Node 20 (CI) / 24 (local).

**Spec:** `docs/superpowers/specs/2026-10-07-experiment-hub-integration-design.md`

## Global Constraints

- Work in the worktree `D:/Dhruv-Personal/Wipro-old/Portfolio-v4/.claude/worktrees/experiment-hub` on branch `feat/experiment-hub-integration`. Never touch the main checkout. **Never push, never deploy.** Stage by explicit path only; commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Env vars: `EXPERIMENTHUB_API_URL`, `EXPERIMENTHUB_API_KEY` (server-only; never `NEXT_PUBLIC_`). Enabled ⇔ both non-blank. Everything must build, test and run with both unset (CI does).
- Cookie `eh_uid`: UUID v4, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=31536000`, `Secure` iff https. Request header `x-eh-uid`, always overwritten by the proxy when enabled.
- Experiment key `portfolio-hero-cta`; variants `control` ("See the work") and `read-the-case-studies` ("Read the case studies"); events `hero_cta_click` (primary) and `contact_submitted` (secondary); feature tag `home-hero`.
- Fail-open: assignment budget 300 ms; tracking budget 500 ms per request (assign + track ≤ 1 s); unavailable → `console.warn("[experiments] <op> unavailable: <code>")`; misconfigured → `console.error("[experiments] <op> misconfigured: <code> <status>")`; never log uid, key, or payloads; never throw out of the library.
- `/` must remain statically prerendered when disabled: `headers()` is called only inside the enabled branch. Verify in `next build` output (`○ /`).
- Never track when `enrolled` is false. Idempotency key `${uid}:${experimentKey}:${eventName}`.
- Honeypot submissions to `/api/contact` never track; the hook attaches only to the genuine-send `return NextResponse.json(SUCCESS_BODY)`.
- Repo gates before "done": `npm run guard:case-studies`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`. Tests: vitest node env, `tests/unit/*.test.ts`, explicit imports from `vitest`, `@` alias → `src`.
- Do not modify `src/components/ui/MetricCounter.*` or `src/lib/utils.ts` (another session's uncommitted work lives in the main checkout).
- The SDK tarball to vendor is at `C:/Users/DHRUVS~1/AppData/Local/Temp/claude/d--Dhruv-Personal-Wipro-old-A-B-Testing-Platform/eb15d73c-429d-45fa-95be-3b1e0206d46e/scratchpad/experiment-hub-sdk-0.1.0.tgz` (built from `A-B-Testing-Platform/sdk/javascript` at commit c3299fe).

---

## File map

| File | Responsibility |
|---|---|
| `vendor/experiment-hub-sdk-0.1.0.tgz`, `package.json`, `package-lock.json` | vendored SDK dependency |
| `src/lib/experiments/config.ts` | env → enabled/config |
| `src/lib/experiments/identity.ts` | cookie/header names, uid generation/validation, cookie options, `readUid` |
| `src/lib/experiments/client.ts` | SDK client factory, `assignOrControl`, `trackConversion` (fail-open) |
| `src/lib/experiments/hero.ts` | experiment key, variants, copy map |
| `src/lib/experiments/contact.ts` | `trackContactSubmission` |
| `src/proxy.ts` | cookie + header injection when enabled |
| `src/components/ui/Button.tsx` | forward `onClick` on link renders |
| `src/components/home/HeroCtaLink.tsx` | client CTA that beacons the click |
| `src/components/home/HeroSection.tsx` | `ctaVariant`/`tracked` props |
| `src/app/page.tsx` | server-side assignment when enabled |
| `src/app/api/experiments/track/route.ts` | same-origin beacon endpoint |
| `src/app/api/contact/route.ts` | conversion hook on genuine success |
| `scripts/experiment-hub-setup.mjs` | idempotent platform setup |
| `.env.example`, `DEPLOYMENT.md`, `content/case-studies/experiment-hub.mdx` | docs + truthful note |
| `tests/unit/experiments-*.test.ts`, `tests/unit/proxy.test.ts`, `tests/unit/hero.test.ts`, `tests/unit/contact.test.ts`, `tests/e2e/home.spec.ts` | tests |

---

### Task 1: Vendor the SDK and add the config module

**Files:**

- Create: `vendor/experiment-hub-sdk-0.1.0.tgz`, `src/lib/experiments/config.ts`
- Modify: `package.json`, `package-lock.json`, `.env.example`, `DEPLOYMENT.md` (env table)
- Test: `tests/unit/experiments-config.test.ts`

**Interfaces:**

- Produces: `getExperimentsConfig(): { apiUrl: string; apiKey: string } | null`, `isExperimentsEnabled(): boolean`; the package `@experiment-hub/sdk` resolvable from `node_modules`.

- [ ] **Step 1: Vendor the tarball and install it**

```bash
mkdir -p vendor
cp "C:/Users/DHRUVS~1/AppData/Local/Temp/claude/d--Dhruv-Personal-Wipro-old-A-B-Testing-Platform/eb15d73c-429d-45fa-95be-3b1e0206d46e/scratchpad/experiment-hub-sdk-0.1.0.tgz" vendor/experiment-hub-sdk-0.1.0.tgz
npm install ./vendor/experiment-hub-sdk-0.1.0.tgz --save --no-audit --no-fund
```

Expected: `package.json` dependencies gain `"@experiment-hub/sdk": "file:vendor/experiment-hub-sdk-0.1.0.tgz"` and `package-lock.json` records it with an `integrity`. Confirm: `node -e "console.log(typeof require('@experiment-hub/sdk').createClient)"` prints `function`.

- [ ] **Step 2: Write the failing test `tests/unit/experiments-config.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { getExperimentsConfig, isExperimentsEnabled } from "@/lib/experiments/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("experiments config", () => {
  it("is disabled when both variables are unset", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    expect(isExperimentsEnabled()).toBe(false);
    expect(getExperimentsConfig()).toBeNull();
  });

  it("is disabled when only one variable is set", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "http://127.0.0.1:4000");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    expect(isExperimentsEnabled()).toBe(false);
  });

  it("treats whitespace-only values as unset", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "   ");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "eh_live_x");
    expect(isExperimentsEnabled()).toBe(false);
  });

  it("returns trimmed config when both are set", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", " http://127.0.0.1:4000/ ");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", " eh_live_x ");
    expect(isExperimentsEnabled()).toBe(true);
    expect(getExperimentsConfig()).toEqual({ apiUrl: "http://127.0.0.1:4000/", apiKey: "eh_live_x" });
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run tests/unit/experiments-config.test.ts`
Expected: FAIL — cannot resolve `@/lib/experiments/config`.

- [ ] **Step 4: Create `src/lib/experiments/config.ts`**

```ts
/**
 * ExperimentHub is opt-in: both variables must be present, otherwise every
 * experiment path is a no-op and the site behaves exactly as before.
 * Read at call time so tests (and Vercel env changes) take effect without a
 * module reload.
 */
export interface ExperimentsConfig {
  apiUrl: string;
  apiKey: string;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export function getExperimentsConfig(): ExperimentsConfig | null {
  const apiUrl = clean(process.env.EXPERIMENTHUB_API_URL);
  const apiKey = clean(process.env.EXPERIMENTHUB_API_KEY);
  if (!apiUrl || !apiKey) return null;
  return { apiUrl, apiKey };
}

export function isExperimentsEnabled(): boolean {
  return getExperimentsConfig() !== null;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run tests/unit/experiments-config.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Document the variables**

Append to `.env.example` (keep the file's existing comment style):

```
# ExperimentHub (A/B tests). Both optional; with either unset the site runs no
# experiments, sets no cookie, and the home page stays static.
EXPERIMENTHUB_API_URL=
EXPERIMENTHUB_API_KEY=
```

In `DEPLOYMENT.md`'s environment-variable table add two rows after `NEXT_PUBLIC_SITE_URL`:

```
| `EXPERIMENTHUB_API_URL` | No (dormant when unset) | Origin of the ExperimentHub API (e.g. `https://hub.example.com`). With `EXPERIMENTHUB_API_KEY`, enables the home-page CTA experiment and makes `/` dynamically rendered. |
| `EXPERIMENTHUB_API_KEY` | No (dormant when unset) | Tenant SDK key (`eh_live_…`). Server-only; never exposed to the browser. |
```

- [ ] **Step 7: Lint, typecheck, commit**

Run: `npm run lint && npx tsc --noEmit`

```bash
git add vendor/experiment-hub-sdk-0.1.0.tgz package.json package-lock.json src/lib/experiments/config.ts tests/unit/experiments-config.test.ts .env.example DEPLOYMENT.md
git commit -m "feat(experiments): vendor @experiment-hub/sdk and add opt-in config

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Identity helpers (cookie, header, uid)

**Files:**

- Create: `src/lib/experiments/identity.ts`
- Test: `tests/unit/experiments-identity.test.ts`

**Interfaces:**

- Produces: `UID_COOKIE`, `UID_HEADER`, `UID_MAX_AGE_SECONDS`, `newUid()`, `isValidUid(v)`, `uidCookieOptions(secure)`, `readUid(source)`, `interface UidSource`.

- [ ] **Step 1: Write the failing test `tests/unit/experiments-identity.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  UID_COOKIE,
  UID_HEADER,
  UID_MAX_AGE_SECONDS,
  isValidUid,
  newUid,
  readUid,
  uidCookieOptions,
} from "@/lib/experiments/identity";

const UUID = "0d3f1c2e-5b6a-4c7d-8e9f-0a1b2c3d4e5f";

function source(cookie: string | undefined, header: string | null) {
  return {
    cookies: { get: (name: string) => (name === UID_COOKIE && cookie ? { value: cookie } : undefined) },
    headers: { get: (name: string) => (name === UID_HEADER ? header : null) },
  };
}

describe("identity", () => {
  it("names the cookie and header", () => {
    expect(UID_COOKIE).toBe("eh_uid");
    expect(UID_HEADER).toBe("x-eh-uid");
    expect(UID_MAX_AGE_SECONDS).toBe(31_536_000);
  });

  it("generates a v4 uuid", () => {
    const uid = newUid();
    expect(isValidUid(uid)).toBe(true);
    expect(newUid()).not.toBe(uid);
  });

  it("rejects malformed ids", () => {
    expect(isValidUid("")).toBe(false);
    expect(isValidUid("not-a-uuid")).toBe(false);
    expect(isValidUid(null)).toBe(false);
    expect(isValidUid(undefined)).toBe(false);
    expect(isValidUid(`${UUID}; Path=/`)).toBe(false);
  });

  it("builds HttpOnly Lax cookie options with a one-year max-age", () => {
    expect(uidCookieOptions(true)).toEqual({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 31_536_000, secure: true });
    expect(uidCookieOptions(false).secure).toBe(false);
  });

  it("reads the cookie first, then the header, and ignores invalid values", () => {
    expect(readUid(source(UUID, null))).toBe(UUID);
    expect(readUid(source(undefined, UUID))).toBe(UUID);
    expect(readUid(source("bad", UUID))).toBe(UUID);
    expect(readUid(source(undefined, "bad"))).toBeNull();
    expect(readUid(source(undefined, null))).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/experiments-identity.test.ts`
Expected: FAIL — cannot resolve `@/lib/experiments/identity`.

- [ ] **Step 3: Create `src/lib/experiments/identity.ts`**

```ts
/**
 * Anonymous experiment identity. One opaque id per browser so the same
 * visitor sees the same variant on every page view. No PII, HttpOnly.
 */
export const UID_COOKIE = "eh_uid";
export const UID_HEADER = "x-eh-uid";
export const UID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newUid(): string {
  return crypto.randomUUID();
}

export function isValidUid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function uidCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: UID_MAX_AGE_SECONDS,
    secure,
  };
}

/** Anything with Next's request-style cookie and header accessors (NextRequest qualifies). */
export interface UidSource {
  cookies: { get(name: string): { value: string } | undefined };
  headers: { get(name: string): string | null };
}

/** Cookie wins over header; the proxy injects the header for the very first request before the cookie exists. */
export function readUid(source: UidSource): string | null {
  const fromCookie = source.cookies.get(UID_COOKIE)?.value;
  if (isValidUid(fromCookie)) return fromCookie;
  const fromHeader = source.headers.get(UID_HEADER);
  return isValidUid(fromHeader) ? fromHeader : null;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/unit/experiments-identity.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
git add src/lib/experiments/identity.ts tests/unit/experiments-identity.test.ts
git commit -m "feat(experiments): anonymous uid cookie/header helpers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Fail-open client wrapper

**Files:**

- Create: `src/lib/experiments/client.ts`
- Test: `tests/unit/experiments-client.test.ts`

**Interfaces:**

- Consumes: `getExperimentsConfig` (Task 1); `@experiment-hub/sdk` (`createClient`, error classes, `Assignment`).
- Produces: `ASSIGN_TIMEOUT_MS = 300`, `TRACK_TIMEOUT_MS = 500`, `CONTROL`, `type ExperimentAssignment`, `createExperimentsClient(options)`, `assignOrControl(uid, experimentKey, options?)`, `trackConversion(uid, experimentKey, eventName, options?)`, `interface ClientOptions { fetch?: typeof globalThis.fetch; timeoutMs?: number }`.

- [ ] **Step 1: Write the failing test `tests/unit/experiments-client.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ASSIGN_TIMEOUT_MS,
  CONTROL,
  TRACK_TIMEOUT_MS,
  assignOrControl,
  trackConversion,
} from "@/lib/experiments/client";

const UID = "0d3f1c2e-5b6a-4c7d-8e9f-0a1b2c3d4e5f";
const KEY = "portfolio-hero-cta";

const assignment = {
  experiment_key: KEY,
  experiment_id: "11111111-1111-4111-8111-111111111111",
  variant_key: "read-the-case-studies",
  variant_id: "22222222-2222-4222-8222-222222222222",
  variant_name: "Read the case studies",
  is_control: false,
  enrolled: true,
  assigned_at: "2026-10-07T00:00:00Z",
};

type Call = { url: string; body: unknown; signal: AbortSignal | undefined };

function fetchReplying(...responses: Array<{ status: number; body: unknown }>) {
  const calls: Call[] = [];
  const queue = [...responses];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined, signal: init?.signal ?? undefined });
    const next = queue.shift() ?? { status: 200, body: {} };
    return new Response(JSON.stringify(next.body), { status: next.status, headers: { "content-type": "application/json" } });
  };
  return { fetch, calls };
}

const fetchRejecting: typeof globalThis.fetch = async () => {
  throw new TypeError("fetch failed");
};

beforeEach(() => {
  vi.stubEnv("EXPERIMENTHUB_API_URL", "http://hub.test");
  vi.stubEnv("EXPERIMENTHUB_API_KEY", "eh_live_test");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("assignOrControl", () => {
  it("returns control without any network call when disabled", async () => {
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    const { fetch, calls } = fetchReplying();
    expect(await assignOrControl(UID, KEY, { fetch })).toEqual(CONTROL);
    expect(calls).toHaveLength(0);
  });

  it("maps a successful assignment", async () => {
    const { fetch, calls } = fetchReplying({ status: 200, body: assignment });
    const result = await assignOrControl(UID, KEY, { fetch });
    expect(result.variantKey).toBe("read-the-case-studies");
    expect(result.enrolled).toBe(true);
    expect(calls[0]?.url).toBe("http://hub.test/v1/assign");
    expect(calls[0]?.body).toEqual({ user_id: UID, experiment_key: KEY, attributes: {} });
    expect(calls[0]?.signal).toBeDefined();
  });

  it("fails open with a warn when the platform is unreachable", async () => {
    const result = await assignOrControl(UID, KEY, { fetch: fetchRejecting });
    expect(result).toEqual(CONTROL);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith("[experiments] assign unavailable: network_error");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("fails open with an error log on misconfiguration (401)", async () => {
    const { fetch } = fetchReplying({ status: 401, body: { error: "unauthorized", message: "nope" } });
    const result = await assignOrControl(UID, KEY, { fetch });
    expect(result).toEqual(CONTROL);
    expect(console.error).toHaveBeenCalledWith("[experiments] assign misconfigured: unauthorized 401");
  });

  it("never logs the uid or the key", async () => {
    await assignOrControl(UID, KEY, { fetch: fetchRejecting });
    const logged = JSON.stringify((console.warn as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).not.toContain(UID);
    expect(logged).not.toContain(KEY);
  });

  it("uses the 300 ms assignment budget", () => {
    expect(ASSIGN_TIMEOUT_MS).toBe(300);
    expect(TRACK_TIMEOUT_MS).toBe(500);
  });
});

describe("trackConversion", () => {
  it("does nothing when disabled", async () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "");
    const { fetch, calls } = fetchReplying();
    await trackConversion(UID, KEY, "hero_cta_click", { fetch });
    expect(calls).toHaveLength(0);
  });

  it("assigns, then tracks with experiment/variant ids and a derived idempotency key", async () => {
    const { fetch, calls } = fetchReplying(
      { status: 200, body: assignment },
      { status: 202, body: { status: "accepted", event_id: "e", received_at: "t" } },
    );
    await trackConversion(UID, KEY, "hero_cta_click", { fetch });
    expect(calls.map((c) => c.url)).toEqual(["http://hub.test/v1/assign", "http://hub.test/v1/events"]);
    expect(calls[1]?.body).toMatchObject({
      user_id: UID,
      experiment_id: assignment.experiment_id,
      variant_id: assignment.variant_id,
      event_type: "conversion",
      event_name: "hero_cta_click",
      idempotency_key: `${UID}:${KEY}:hero_cta_click`,
    });
  });

  it("does not track when the user is not enrolled", async () => {
    const { fetch, calls } = fetchReplying({ status: 200, body: { ...assignment, enrolled: false, is_control: true, variant_key: "control" } });
    await trackConversion(UID, KEY, "hero_cta_click", { fetch });
    expect(calls).toHaveLength(1);
  });

  it("swallows tracking failures with a warn", async () => {
    const { fetch } = fetchReplying({ status: 200, body: assignment }, { status: 503, body: { error: "service_unavailable", message: "down" } });
    await expect(trackConversion(UID, KEY, "hero_cta_click", { fetch })).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith("[experiments] track unavailable: service_unavailable");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/experiments-client.test.ts`
Expected: FAIL — cannot resolve `@/lib/experiments/client`.

- [ ] **Step 3: Create `src/lib/experiments/client.ts`**

```ts
import {
  ExperimentHubError,
  NetworkError,
  RateLimitError,
  ServiceUnavailableError,
  createClient,
  type Assignment,
  type ExperimentHubClient,
} from "@experiment-hub/sdk";
import { getExperimentsConfig } from "./config";

/** Assignment sits on the home page's critical path: a short budget, then control. */
export const ASSIGN_TIMEOUT_MS = 300;
/** Tracking is two requests (assign for ids, then the event); 500 ms each keeps a contact submit under +1 s. */
export const TRACK_TIMEOUT_MS = 500;

export interface ControlFallback {
  variantKey: "control";
  enrolled: false;
}

export const CONTROL: ControlFallback = { variantKey: "control", enrolled: false };

export type ExperimentAssignment = Assignment | ControlFallback;

export interface ClientOptions {
  /** Injected by tests; defaults to the global fetch. */
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

/** The only place the SDK is constructed. `null` when experiments are disabled. */
export function createExperimentsClient(options: ClientOptions = {}): ExperimentHubClient | null {
  const config = getExperimentsConfig();
  if (!config) return null;
  return createClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
    timeoutMs: options.timeoutMs ?? ASSIGN_TIMEOUT_MS,
    fetch: options.fetch,
  });
}

function isUnavailable(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof ServiceUnavailableError ||
    error instanceof RateLimitError
  );
}

// Fixed labels only: never the uid, the key, or a response body.
function logFailure(operation: "assign" | "track", error: unknown): void {
  const code = error instanceof ExperimentHubError ? error.code : "unknown";
  if (isUnavailable(error)) {
    console.warn(`[experiments] ${operation} unavailable: ${code}`);
    return;
  }
  const status = error instanceof ExperimentHubError && error.status !== undefined ? error.status : "n/a";
  console.error(`[experiments] ${operation} misconfigured: ${code} ${status}`);
}

/** Never throws; the site must render even when the platform is down or misconfigured. */
export async function assignOrControl(
  uid: string,
  experimentKey: string,
  options: ClientOptions = {},
): Promise<ExperimentAssignment> {
  const hub = createExperimentsClient({ ...options, timeoutMs: options.timeoutMs ?? ASSIGN_TIMEOUT_MS });
  if (!hub) return CONTROL;
  try {
    return await hub.assign({ userId: uid, experimentKey });
  } catch (error) {
    logFailure("assign", error);
    return CONTROL;
  }
}

/**
 * Record a conversion for an enrolled user. Re-assigning is cheap and sticky,
 * and it is how the event gets the experiment/variant ids the rollup needs.
 * Un-enrolled users are never tracked (the rollup has no assignment join).
 */
export async function trackConversion(
  uid: string,
  experimentKey: string,
  eventName: string,
  options: ClientOptions = {},
): Promise<void> {
  const hub = createExperimentsClient({ ...options, timeoutMs: options.timeoutMs ?? TRACK_TIMEOUT_MS });
  if (!hub) return;
  try {
    const assignment = await hub.assign({ userId: uid, experimentKey });
    if (!assignment.enrolled) return;
    await hub.track({
      userId: uid,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
      type: "conversion",
      name: eventName,
      idempotencyKey: `${uid}:${experimentKey}:${eventName}`,
    });
  } catch (error) {
    logFailure("track", error);
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/unit/experiments-client.test.ts`
Expected: PASS, 10 tests. If the SDK's `NetworkError` for a rejecting fetch carries code `network_error` (it does), the warn assertion matches exactly.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
git add src/lib/experiments/client.ts tests/unit/experiments-client.test.ts
git commit -m "feat(experiments): fail-open assign and track wrappers over the SDK

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Proxy mints the cookie and injects the header

**Files:**

- Modify: `src/proxy.ts`
- Test: `tests/unit/proxy.test.ts`

**Interfaces:**

- Consumes: `isExperimentsEnabled` (Task 1); `UID_COOKIE`, `UID_HEADER`, `isValidUid`, `newUid`, `uidCookieOptions` (Task 2).

- [ ] **Step 1: Write the failing test `tests/unit/proxy.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const UUID = "0d3f1c2e-5b6a-4c7d-8e9f-0a1b2c3d4e5f";
const UUID_RE = /^[0-9a-f-]{36}$/i;

async function run(request: NextRequest) {
  vi.resetModules();
  const { proxy } = await import("@/proxy");
  return proxy(request);
}

function enable() {
  vi.stubEnv("EXPERIMENTHUB_API_URL", "http://hub.test");
  vi.stubEnv("EXPERIMENTHUB_API_KEY", "eh_live_test");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy experiment identity", () => {
  it("sets no cookie and no header when disabled", async () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    const res = await run(new NextRequest("https://dhruvsinghal.codes/"));
    expect(res.cookies.get("eh_uid")).toBeUndefined();
    expect(res.headers.get("x-middleware-request-x-eh-uid")).toBeNull();
    expect(res.headers.get("content-security-policy")).toContain("default-src 'self'");
  });

  it("mints an HttpOnly Lax Secure cookie and forwards it as x-eh-uid when enabled", async () => {
    enable();
    const res = await run(new NextRequest("https://dhruvsinghal.codes/"));
    const cookie = res.cookies.get("eh_uid");
    expect(cookie?.value).toMatch(UUID_RE);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(31_536_000);
    expect(cookie?.secure).toBe(true);
    expect(res.headers.get("x-middleware-request-x-eh-uid")).toBe(cookie?.value);
    expect(res.headers.get("content-security-policy")).toContain("connect-src 'self'");
  });

  it("is not Secure over plain http (local dev)", async () => {
    enable();
    const res = await run(new NextRequest("http://localhost:3000/"));
    expect(res.cookies.get("eh_uid")?.secure).toBe(false);
  });

  it("reuses an existing valid cookie without re-setting it", async () => {
    enable();
    const res = await run(new NextRequest("https://dhruvsinghal.codes/", { headers: { cookie: `eh_uid=${UUID}` } }));
    expect(res.cookies.get("eh_uid")).toBeUndefined();
    expect(res.headers.get("x-middleware-request-x-eh-uid")).toBe(UUID);
  });

  it("replaces an invalid cookie and overwrites a forged header", async () => {
    enable();
    const res = await run(
      new NextRequest("https://dhruvsinghal.codes/", { headers: { cookie: "eh_uid=forged", "x-eh-uid": "attacker" } }),
    );
    const minted = res.cookies.get("eh_uid")?.value;
    expect(minted).toMatch(UUID_RE);
    expect(res.headers.get("x-middleware-request-x-eh-uid")).toBe(minted);
  });

  it("still redirects www to the apex before any identity work", async () => {
    enable();
    const res = await run(new NextRequest("https://www.dhruvsinghal.codes/x", { headers: { host: "www.dhruvsinghal.codes" } }));
    expect(res.status).toBe(308);
    expect(res.cookies.get("eh_uid")).toBeUndefined();
  });
});
```

If `src/lib/site.ts` derives `WWW_SITE_HOST` from `NEXT_PUBLIC_SITE_URL` and the default is not `dhruvsinghal.codes`, set `vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://dhruvsinghal.codes")` inside `enable()` and in the disabled test — read `site.ts` first and match whatever host it computes.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/proxy.test.ts`
Expected: the two "disabled"/"redirect" tests may pass already; the enabled tests FAIL (no cookie, no header).

- [ ] **Step 3: Modify `src/proxy.ts`** — keep every existing line; change only the `NextResponse.next()` construction. The new body of `proxy` after the www-redirect block:

```ts
  const response = experimentsEnabled() ? withExperimentIdentity(request) : NextResponse.next();

  // Security headers
  … (unchanged)
```

and add above `export function proxy` (after the imports):

```ts
import { isExperimentsEnabled } from "@/lib/experiments/config";
import { UID_COOKIE, UID_HEADER, isValidUid, newUid, uidCookieOptions } from "@/lib/experiments/identity";

// Read at request time: the Edge runtime exposes process.env, and tests stub it.
function experimentsEnabled(): boolean {
  return isExperimentsEnabled();
}

/**
 * Give every visitor an anonymous id for experiment stickiness. The header is
 * always overwritten so a client cannot choose its own id; the cookie is only
 * (re)set when missing or malformed.
 */
function withExperimentIdentity(request: NextRequest): NextResponse {
  const existing = request.cookies.get(UID_COOKIE)?.value;
  const uid = isValidUid(existing) ? existing : newUid();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(UID_HEADER, uid);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (uid !== existing) {
    response.cookies.set(UID_COOKIE, uid, uidCookieOptions(request.nextUrl.protocol === "https:"));
  }
  return response;
}
```

Keep the existing `matcher` config unchanged.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/unit/proxy.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
git add src/proxy.ts tests/unit/proxy.test.ts
git commit -m "feat(experiments): proxy mints the eh_uid cookie and forwards x-eh-uid when enabled

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Hero CTA variant, tracked link, server-side assignment

**Files:**

- Create: `src/lib/experiments/hero.ts`, `src/components/home/HeroCtaLink.tsx`
- Modify: `src/components/ui/Button.tsx` (forward `onClick` on link renders), `src/components/home/HeroSection.tsx` (props), `src/app/page.tsx` (assignment)
- Test: `tests/unit/hero.test.ts`; extend `tests/e2e/home.spec.ts`

**Interfaces:**

- Consumes: `isExperimentsEnabled` (T1); `UID_HEADER`, `isValidUid` (T2); `assignOrControl` (T3).
- Produces: `HERO_CTA_EXPERIMENT = "portfolio-hero-cta"`, `HERO_CTA_EVENT = "hero_cta_click"`, `HERO_CTA_VARIANTS`, `HeroCtaVariant`, `HERO_CTA_COPY`, `heroCtaCopy(variantKey)`; `HeroSection` props `{ ctaVariant?: string; tracked?: boolean }`.

- [ ] **Step 1: Write the failing test `tests/unit/hero.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { HERO_CTA_COPY, HERO_CTA_EVENT, HERO_CTA_EXPERIMENT, HERO_CTA_VARIANTS, heroCtaCopy } from "@/lib/experiments/hero";

describe("hero CTA experiment", () => {
  it("names the experiment, event and variants", () => {
    expect(HERO_CTA_EXPERIMENT).toBe("portfolio-hero-cta");
    expect(HERO_CTA_EVENT).toBe("hero_cta_click");
    expect(HERO_CTA_VARIANTS).toEqual(["control", "read-the-case-studies"]);
  });

  it("maps every variant to copy", () => {
    expect(HERO_CTA_COPY.control).toBe("See the work");
    expect(HERO_CTA_COPY["read-the-case-studies"]).toBe("Read the case studies");
  });

  it("falls back to control copy for unknown or missing variants", () => {
    expect(heroCtaCopy(undefined)).toBe("See the work");
    expect(heroCtaCopy("renamed-on-server")).toBe("See the work");
    expect(heroCtaCopy("read-the-case-studies")).toBe("Read the case studies");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/hero.test.ts`
Expected: FAIL — cannot resolve `@/lib/experiments/hero`.

- [ ] **Step 3: Create `src/lib/experiments/hero.ts`**

```ts
/** The one experiment this site runs today, and the copy each arm shows. */
export const HERO_CTA_EXPERIMENT = "portfolio-hero-cta";
export const HERO_CTA_EVENT = "hero_cta_click";

export const HERO_CTA_VARIANTS = ["control", "read-the-case-studies"] as const;
export type HeroCtaVariant = (typeof HERO_CTA_VARIANTS)[number];

export const HERO_CTA_COPY: Record<HeroCtaVariant, string> = {
  control: "See the work",
  "read-the-case-studies": "Read the case studies",
};

function isHeroCtaVariant(value: string | undefined): value is HeroCtaVariant {
  return value !== undefined && (HERO_CTA_VARIANTS as readonly string[]).includes(value);
}

/** Unknown keys (a variant renamed on the server) render control, never an empty button. */
export function heroCtaCopy(variantKey: string | undefined): string {
  return isHeroCtaVariant(variantKey) ? HERO_CTA_COPY[variantKey] : HERO_CTA_COPY.control;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/unit/hero.test.ts` → PASS, 3 tests.

- [ ] **Step 5: Forward `onClick` in `src/components/ui/Button.tsx`** — in the `href` branch, both renders:

```tsx
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" onClick={onClick} {...rest}>
```

```tsx
      <Link href={href} className={classes} onClick={onClick} {...rest}>
```

(`onClick` is already destructured; today it is dropped for links.)

- [ ] **Step 6: Create `src/components/home/HeroCtaLink.tsx`**

```tsx
"use client";

import { Button } from "@/components/ui/Button";
import { HERO_CTA_EVENT } from "@/lib/experiments/hero";

/**
 * The hero CTA when the visitor is enrolled in the experiment: identical to
 * the plain Button, plus a fire-and-forget beacon to our own origin. The
 * navigation is an in-page anchor, so nothing waits on the request.
 */
export function HeroCtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  const onClick = () => {
    try {
      void fetch("/api/experiments/track", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: HERO_CTA_EVENT }),
      }).catch(() => undefined);
    } catch {
      // A beacon must never interfere with the click.
    }
  };
  return (
    <Button href={href} onClick={onClick}>
      {children}
    </Button>
  );
}
```

- [ ] **Step 7: Thread the variant through `src/components/home/HeroSection.tsx`**

Add imports:

```tsx
import { HeroCtaLink } from "./HeroCtaLink";
import { heroCtaCopy } from "@/lib/experiments/hero";
```

Change the signature and the primary CTA (line ~21 and ~41):

```tsx
interface HeroSectionProps {
  /** Variant key from ExperimentHub; unknown or absent renders control copy. */
  ctaVariant?: string;
  /** True only for enrolled visitors: swaps in the click-tracking link. */
  tracked?: boolean;
}

export function HeroSection({ ctaVariant, tracked = false }: HeroSectionProps) {
  const ctaCopy = heroCtaCopy(ctaVariant);
```

```tsx
            {tracked ? (
              <HeroCtaLink href="#work">{ctaCopy}</HeroCtaLink>
            ) : (
              <Button href="#work">{ctaCopy}</Button>
            )}
```

Everything else in the file stays as is.

- [ ] **Step 8: Assign in `src/app/page.tsx`** — add imports and a helper; make `Home` async; pass the props. Read the file first; the only structural change is `function Home()` → `async function Home()` and the `<HeroSection />` line.

```tsx
import { headers } from "next/headers";
import { assignOrControl, type ExperimentAssignment } from "@/lib/experiments/client";
import { isExperimentsEnabled } from "@/lib/experiments/config";
import { HERO_CTA_EXPERIMENT } from "@/lib/experiments/hero";
import { UID_HEADER, isValidUid } from "@/lib/experiments/identity";

/**
 * Only when experiments are enabled does this page read request headers —
 * which is what turns it from static to dynamic. Disabled keeps `/` static.
 */
async function heroAssignment(): Promise<ExperimentAssignment | null> {
  if (!isExperimentsEnabled()) return null;
  const uid = (await headers()).get(UID_HEADER);
  if (!isValidUid(uid)) return null;
  return assignOrControl(uid, HERO_CTA_EXPERIMENT);
}

export default async function Home() {
  const hero = await heroAssignment();
  // … existing body unchanged …
      <HeroSection ctaVariant={hero?.variantKey} tracked={hero?.enrolled ?? false} />
```

- [ ] **Step 9: Extend `tests/e2e/home.spec.ts`** — add one test in the existing describe (match the file's style; it uses `page.goto("/")`):

```ts
  test("hero CTA renders control copy and sets no experiment cookie when disabled", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.headers()["set-cookie"] ?? "").not.toContain("eh_uid");
    await expect(page.getByRole("link", { name: "See the work" })).toBeVisible();
  });
```

- [ ] **Step 10: Verify static rendering and the gates**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build 2>&1 | grep -E "^(○|ƒ|●)|/ "`
Expected: all green; the route table marks `/` as `○ (Static)`. If `/` shows `ƒ (Dynamic)`, `headers()` is being reached on the disabled path — fix before continuing.

Then: `npm run test:e2e -- --project=chromium tests/e2e/home.spec.ts` (Playwright boots `npm run start` from the build). Expected: PASS including the new test.

- [ ] **Step 11: Commit**

```bash
git add src/lib/experiments/hero.ts src/components/home/HeroCtaLink.tsx src/components/ui/Button.tsx src/components/home/HeroSection.tsx src/app/page.tsx tests/unit/hero.test.ts tests/e2e/home.spec.ts
git commit -m "feat(experiments): hero CTA variant with server-side assignment and a tracked link

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Same-origin track route

**Files:**

- Create: `src/app/api/experiments/track/route.ts`
- Test: `tests/unit/experiments-track-route.test.ts`

**Interfaces:**

- Consumes: `isExperimentsEnabled` (T1), `readUid` (T2), `trackConversion` (T3), `HERO_CTA_EVENT`, `HERO_CTA_EXPERIMENT` (T5).

- [ ] **Step 1: Write the failing test `tests/unit/experiments-track-route.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const UUID = "0d3f1c2e-5b6a-4c7d-8e9f-0a1b2c3d4e5f";
const assignment = {
  experiment_key: "portfolio-hero-cta",
  experiment_id: "11111111-1111-4111-8111-111111111111",
  variant_key: "control",
  variant_id: "22222222-2222-4222-8222-222222222222",
  variant_name: "See the work",
  is_control: true,
  enrolled: true,
  assigned_at: "2026-10-07T00:00:00Z",
};

function stubFetch(...responses: Array<{ status: number; body: unknown }>) {
  const calls: Array<{ url: string; body: unknown }> = [];
  const queue = [...responses];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = queue.shift() ?? { status: 200, body: {} };
    return new Response(JSON.stringify(next.body), { status: next.status, headers: { "content-type": "application/json" } });
  });
  return calls;
}

async function post(body: string, cookie?: string) {
  vi.resetModules();
  const { POST } = await import("@/app/api/experiments/track/route");
  return POST(
    new NextRequest("http://localhost:3000/api/experiments/track", {
      method: "POST",
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body,
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("EXPERIMENTHUB_API_URL", "http://hub.test");
  vi.stubEnv("EXPERIMENTHUB_API_KEY", "eh_live_test");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/experiments/track", () => {
  it("rejects malformed JSON and unknown events", async () => {
    stubFetch();
    expect((await post("{not json", `eh_uid=${UUID}`)).status).toBe(400);
    expect((await post(JSON.stringify({ event: "something_else" }), `eh_uid=${UUID}`)).status).toBe(400);
    expect((await post(JSON.stringify({}), `eh_uid=${UUID}`)).status).toBe(400);
  });

  it("rejects oversized bodies", async () => {
    stubFetch();
    const res = await post(JSON.stringify({ event: "hero_cta_click", pad: "x".repeat(300) }), `eh_uid=${UUID}`);
    expect(res.status).toBe(400);
  });

  it("answers 204 and calls nothing when disabled", async () => {
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    const calls = stubFetch();
    const res = await post(JSON.stringify({ event: "hero_cta_click" }), `eh_uid=${UUID}`);
    expect(res.status).toBe(204);
    expect(calls).toHaveLength(0);
  });

  it("answers 204 and calls nothing without a uid", async () => {
    const calls = stubFetch();
    const res = await post(JSON.stringify({ event: "hero_cta_click" }));
    expect(res.status).toBe(204);
    expect(calls).toHaveLength(0);
  });

  it("tracks an enrolled visitor's click once per uid and still answers 204", async () => {
    const calls = stubFetch({ status: 200, body: assignment }, { status: 202, body: { status: "accepted", event_id: "e", received_at: "t" } });
    const res = await post(JSON.stringify({ event: "hero_cta_click" }), `eh_uid=${UUID}`);
    expect(res.status).toBe(204);
    expect(calls.map((c) => c.url)).toEqual(["http://hub.test/v1/assign", "http://hub.test/v1/events"]);
    expect(calls[1]?.body).toMatchObject({
      user_id: UUID,
      event_name: "hero_cta_click",
      idempotency_key: `${UUID}:portfolio-hero-cta:hero_cta_click`,
    });
  });

  it("answers 204 even when the platform is down", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    const res = await post(JSON.stringify({ event: "hero_cta_click" }), `eh_uid=${UUID}`);
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/experiments-track-route.test.ts`
Expected: FAIL — cannot resolve the route module.

- [ ] **Step 3: Create `src/app/api/experiments/track/route.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { trackConversion } from "@/lib/experiments/client";
import { isExperimentsEnabled } from "@/lib/experiments/config";
import { HERO_CTA_EVENT, HERO_CTA_EXPERIMENT } from "@/lib/experiments/hero";
import { readUid } from "@/lib/experiments/identity";

/** Allow-list: the browser may only report events we defined, for experiments we run. */
const EVENTS: Record<string, { experimentKey: string }> = {
  [HERO_CTA_EVENT]: { experimentKey: HERO_CTA_EXPERIMENT },
};

const MAX_BODY_BYTES = 256;

function badRequest() {
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

function noContent() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  let eventName: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return badRequest();
    eventName = (JSON.parse(text) as { event?: unknown }).event;
  } catch {
    return badRequest();
  }
  if (typeof eventName !== "string") return badRequest();
  const event = EVENTS[eventName];
  if (!event) return badRequest();

  // From here on the answer is always 204: the beacon must not become an
  // oracle for whether experiments are on or whether this visitor is enrolled.
  if (!isExperimentsEnabled()) return noContent();
  const uid = readUid(request);
  if (!uid) return noContent();

  await trackConversion(uid, event.experimentKey, eventName);
  return noContent();
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/unit/experiments-track-route.test.ts` → PASS, 6 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
git add src/app/api/experiments/track/route.ts tests/unit/experiments-track-route.test.ts
git commit -m "feat(experiments): same-origin beacon route for CTA clicks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Contact-submit conversion

**Files:**

- Create: `src/lib/experiments/contact.ts`
- Modify: `src/app/api/contact/route.ts` (one `await` before the genuine-send success return)
- Test: extend `tests/unit/contact.test.ts`

**Interfaces:**

- Consumes: `isExperimentsEnabled` (T1), `readUid`, `UidSource` (T2), `trackConversion` (T3), `HERO_CTA_EXPERIMENT` (T5).
- Produces: `CONTACT_EVENT = "contact_submitted"`, `trackContactSubmission(source: UidSource): Promise<void>`.

- [ ] **Step 1: Read `tests/unit/contact.test.ts`** to learn its request helper (it does `vi.resetModules()`, `vi.stubEnv(...)`, dynamic-imports `next/server` and the route, builds a `NextRequest` with a JSON body). Reuse that helper. Then add, at the end of the file, a new describe:

```ts
describe("POST /api/contact experiment tracking", () => {
  const UUID = "0d3f1c2e-5b6a-4c7d-8e9f-0a1b2c3d4e5f";
  const assignment = {
    experiment_key: "portfolio-hero-cta",
    experiment_id: "11111111-1111-4111-8111-111111111111",
    variant_key: "control",
    variant_id: "22222222-2222-4222-8222-222222222222",
    variant_name: "See the work",
    is_control: true,
    enrolled: true,
    assigned_at: "2026-10-07T00:00:00Z",
  };
  const valid = { name: "Ada", email: "ada@example.com", subject: "Hello", message: "A message that is comfortably over twenty characters." };

  function stubFetch() {
    const calls: Array<{ url: string; body: unknown }> = [];
    const queue = [
      { status: 200, body: assignment },
      { status: 202, body: { status: "accepted", event_id: "e", received_at: "t" } },
    ];
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const next = queue.shift() ?? { status: 200, body: {} };
      return new Response(JSON.stringify(next.body), { status: next.status, headers: { "content-type": "application/json" } });
    });
    return calls;
  }

  beforeEach(() => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "http://hub.test");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "eh_live_test");
    vi.stubEnv("RESEND_API_KEY", ""); // console fallback path = genuine success without email
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("tracks contact_submitted once on a genuine success", async () => {
    const calls = stubFetch();
    const res = await postContact(valid, { cookie: `eh_uid=${UUID}` }); // adapt to the file's helper
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.url)).toEqual(["http://hub.test/v1/assign", "http://hub.test/v1/events"]);
    expect(calls[1]?.body).toMatchObject({ user_id: UUID, event_name: "contact_submitted", idempotency_key: `${UUID}:portfolio-hero-cta:contact_submitted` });
  });

  it("never tracks a honeypot submission", async () => {
    const calls = stubFetch();
    const res = await postContact({ ...valid, website: "http://spam.example" }, { cookie: `eh_uid=${UUID}` });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(0);
  });

  it("does not track without a uid cookie", async () => {
    const calls = stubFetch();
    await postContact(valid);
    expect(calls).toHaveLength(0);
  });

  it("keeps the success response when tracking fails", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    const res = await postContact(valid, { cookie: `eh_uid=${UUID}` });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });
});
```

`postContact(body, extraHeaders?)` is whatever the existing helper is called; if it does not accept extra headers, extend it to spread them into the `NextRequest` headers (keep existing callers working). The `vi.stubEnv("NODE_ENV", …)` must NOT be `production` for the console-fallback path to return 200 (the route's 503 branch); the existing tests already run that way.

- [ ] **Step 2: Run to verify the new tests fail**

Run: `npx vitest run tests/unit/contact.test.ts`
Expected: the new "tracks contact_submitted" test FAILS (no fetch calls); the others may pass vacuously — that is expected until Step 3.

- [ ] **Step 3: Create `src/lib/experiments/contact.ts`**

```ts
import { trackConversion } from "./client";
import { isExperimentsEnabled } from "./config";
import { HERO_CTA_EXPERIMENT } from "./hero";
import { readUid, type UidSource } from "./identity";

export const CONTACT_EVENT = "contact_submitted";

/**
 * A genuine contact submission is the business outcome behind the hero
 * experiment. Call only on the real-send success path — never on the
 * honeypot path, which returns the same body by design.
 */
export async function trackContactSubmission(source: UidSource): Promise<void> {
  if (!isExperimentsEnabled()) return;
  const uid = readUid(source);
  if (!uid) return;
  await trackConversion(uid, HERO_CTA_EXPERIMENT, CONTACT_EVENT);
}
```

- [ ] **Step 4: Hook `src/app/api/contact/route.ts`** — add the import and, immediately before the genuine-send `return NextResponse.json(SUCCESS_BODY);` (the one after the Resend/console-fallback block, ~line 281 — NOT the honeypot return ~line 194), insert:

```ts
    await trackContactSubmission(request);
```

Import: `import { trackContactSubmission } from "@/lib/experiments/contact";`. Do not change the ordering of honeypot → validation → offline → rate limit → send; do not log anything new.

- [ ] **Step 5: Run the whole contact suite**

Run: `npx vitest run tests/unit/contact.test.ts`
Expected: PASS — all pre-existing tests plus the 4 new ones.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
git add src/lib/experiments/contact.ts src/app/api/contact/route.ts tests/unit/contact.test.ts
git commit -m "feat(experiments): count genuine contact submissions as conversions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Platform setup script, docs, case-study note

**Files:**

- Create: `scripts/experiment-hub-setup.mjs`
- Modify: `DEPLOYMENT.md` (new "Experiments" section), `content/case-studies/experiment-hub.mdx` (one bullet in "Limits and next")

- [ ] **Step 1: Create `scripts/experiment-hub-setup.mjs`**

```js
#!/usr/bin/env node
/**
 * Idempotently create what the home-page CTA experiment needs on an
 * ExperimentHub instance: two conversion metrics, the experiment with its two
 * variants, the metric attachments, and a running status.
 *
 * Usage:
 *   EXPERIMENTHUB_API_URL=http://127.0.0.1:4000 \
 *   EXPERIMENTHUB_ADMIN_EMAIL=admin@local.dev EXPERIMENTHUB_ADMIN_PASSWORD=... \
 *   node scripts/experiment-hub-setup.mjs
 *
 * Against a loopback URL the demo admin from `mix dev.demo` is the default.
 * Nothing here is secret: it uses the management API with a short-lived JWT.
 */

const EXPERIMENT = {
  key: "portfolio-hero-cta",
  name: "Portfolio hero CTA",
  hypothesis: "Naming the case studies in the hero CTA increases click-through to the work and, downstream, contact submissions.",
  description: "dhruvsinghal.codes home page. Created by scripts/experiment-hub-setup.mjs.",
  feature_tag: "home-hero",
  variants: [
    { key: "control", name: "See the work", is_control: true, traffic_allocation: 5000, sort_order: 0 },
    { key: "read-the-case-studies", name: "Read the case studies", is_control: false, traffic_allocation: 5000, sort_order: 1 },
  ],
};

const METRICS = [
  { key: "hero_cta_click", name: "Hero CTA click", role: "primary", event: "hero_cta_click", description: "Visitors who clicked the hero call-to-action, over visitors assigned." },
  { key: "contact_submitted", name: "Contact submitted", role: "secondary", event: "contact_submitted", description: "Visitors who sent a genuine contact-form message, over visitors assigned." },
];

const baseUrl = (process.env.EXPERIMENTHUB_API_URL ?? "").trim().replace(/\/+$/, "");
if (!baseUrl) fail("EXPERIMENTHUB_API_URL is required");
const loopback = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl);
const email = process.env.EXPERIMENTHUB_ADMIN_EMAIL ?? (loopback ? "admin@local.dev" : "");
const password = process.env.EXPERIMENTHUB_ADMIN_PASSWORD ?? (loopback ? "ValidP@ssword123" : "");
if (!email || !password) fail("EXPERIMENTHUB_ADMIN_EMAIL and EXPERIMENTHUB_ADMIN_PASSWORD are required for a non-local URL");

function fail(message) {
  console.error(`experiment-hub-setup: ${message}`);
  process.exit(1);
}

async function api(method, path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) fail(`${method} ${path} → ${res.status} ${text.slice(0, 300)}`);
  return json;
}

const login = await api("POST", "/api/v1/auth/login", {
  email,
  password,
  ...(process.env.EXPERIMENTHUB_TENANT_ID ? { tenant_id: process.env.EXPERIMENTHUB_TENANT_ID } : {}),
});
const token = login.access_token;

// Metric definitions (shape mirrors the platform's seeded, analysable metrics).
const existingMetrics = (await api("GET", "/api/v1/metric-definitions", undefined, token)).data ?? [];
const metricIds = {};
for (const m of METRICS) {
  const found = existingMetrics.find((d) => d.key === m.key);
  if (found) {
    metricIds[m.key] = found.id;
    console.log(`metric ${m.key}: exists (${found.id})`);
    continue;
  }
  const created = await api("POST", "/api/v1/metric-definitions", {
    key: m.key,
    name: m.name,
    description: m.description,
    metric_type: "ratio",
    definition: { event_name: m.event, numerator: "conversion", denominator: "assignment" },
  }, token);
  metricIds[m.key] = (created.data ?? created).id;
  console.log(`metric ${m.key}: created (${metricIds[m.key]})`);
}

// Experiment.
const list = (await api("GET", "/api/v1/experiments", undefined, token)).data ?? [];
let experiment = list.find((e) => e.key === EXPERIMENT.key);
if (experiment) {
  console.log(`experiment ${EXPERIMENT.key}: exists (${experiment.id}, ${experiment.status})`);
} else {
  const created = await api("POST", "/api/v1/experiments", EXPERIMENT, token);
  experiment = created.data ?? created;
  console.log(`experiment ${EXPERIMENT.key}: created (${experiment.id})`);
}

// Attach metrics (ignore "already attached" conflicts).
const attached = (await api("GET", `/api/v1/experiments/${experiment.id}/metrics`, undefined, token)).data ?? [];
for (const m of METRICS) {
  if (attached.some((a) => a.metric_definition_id === metricIds[m.key] || a.metric_definition?.id === metricIds[m.key])) {
    console.log(`attach ${m.key}: exists`);
    continue;
  }
  await api("POST", `/api/v1/experiments/${experiment.id}/metrics`, { metric_definition_id: metricIds[m.key], role: m.role }, token);
  console.log(`attach ${m.key}: ${m.role}`);
}

// Start if still a draft.
const detail = (await api("GET", `/api/v1/experiments/${experiment.id}`, undefined, token)).data ?? experiment;
if (detail.status === "draft") {
  await api("POST", `/api/v1/experiments/${experiment.id}/start`, {}, token);
  console.log(`experiment ${EXPERIMENT.key}: started`);
} else {
  console.log(`experiment ${EXPERIMENT.key}: status ${detail.status} (left as is)`);
}

console.log(`\nSet on the site:\n  EXPERIMENTHUB_API_URL=${baseUrl}\n  EXPERIMENTHUB_API_KEY=<the tenant SDK key>\n`);
```

Response envelopes differ per endpoint (`{data: …}` vs bare); the `?? created`/`?? experiment` fallbacks cover both. Verify against the running stack in Step 3 and adjust the two shapes (`.data` unwrapping) if a call fails — the script must end with every line printed and exit 0 on a second run too.

- [ ] **Step 2: Add the "Experiments" section to `DEPLOYMENT.md`** (after the env-var table / before "First-time Deployment"):

```markdown
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
```

- [ ] **Step 3: Edit `content/case-studies/experiment-hub.mdx`** — in "## Limits and next", replace the bullet that begins `**No production tenant.**` with:

```
- **First real tenant, not yet live.** This site's home-page call-to-action is wired to run as an experiment through the platform's [JavaScript SDK](https://github.com/atavisticrystal6888/A-B-Testing-Platform/tree/main/sdk/javascript) — server-side assignment, an anonymous first-party cookie for stickiness, click and contact-form conversions — and stays dormant until the platform has a hosted instance. The first real results will replace the seed numbers above. Adoption, assignment latency under load and ingestion throughput are still not measured.
```

Keep the frontmatter, tldr, metaDescription and every other line unchanged; `npm run guard:case-studies` and `tests/unit/case-study-frontmatter.test.ts` must still pass.

- [ ] **Step 4: Gates and commit**

Run: `npm run guard:case-studies && npm run lint && npx tsc --noEmit && npm test`

```bash
git add scripts/experiment-hub-setup.mjs DEPLOYMENT.md content/case-studies/experiment-hub.mdx
git commit -m "docs(experiments): platform setup script, deployment notes, truthful case-study note

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Live verification against the local platform

**Files:**

- Modify: `DEPLOYMENT.md` (append "Verified locally" under the Experiments section)

**Preconditions:** ExperimentHub is running at `http://127.0.0.1:4000` from the platform's main checkout (health 200). The tenant SDK key is supplied by the controller in the dispatch (never commit it).

- [ ] **Step 1: Set up the experiment on the platform**

Run: `EXPERIMENTHUB_API_URL=http://127.0.0.1:4000 node scripts/experiment-hub-setup.mjs` — twice. Expected: first run creates metrics/experiment and starts it; second run prints "exists" lines and exits 0. Fix the script's response unwrapping if any call fails, and re-run both.

- [ ] **Step 2: Build and run the site with experiments enabled**

```bash
npm run build
EXPERIMENTHUB_API_URL=http://127.0.0.1:4000 EXPERIMENTHUB_API_KEY=<key> npm run start   # background, port 3000
```

(PowerShell: `$env:EXPERIMENTHUB_API_URL=…; $env:EXPERIMENTHUB_API_KEY=…; npm run start`.)

- [ ] **Step 3: Exercise the flow with curl**

```bash
curl -si http://localhost:3000/ | grep -iE "^set-cookie: eh_uid|See the work|Read the case studies"
```
Expected: one `Set-Cookie: eh_uid=…; Path=/; Max-Age=31536000; HttpOnly; SameSite=lax` and exactly one of the two CTA copies in the HTML. Repeat with `-H "cookie: eh_uid=<that value>"` → same copy, no Set-Cookie.

```bash
curl -si -X POST http://localhost:3000/api/experiments/track -H "content-type: application/json" -H "cookie: eh_uid=<value>" -d '{"event":"hero_cta_click"}' | head -1
```
Expected: `HTTP/1.1 204`. Then a genuine contact submit (no RESEND key → console fallback):

```bash
curl -s -X POST http://localhost:3000/api/contact -H "content-type: application/json" -H "cookie: eh_uid=<value>" -d '{"name":"Probe","email":"probe@example.com","subject":"Live check","message":"This is a live verification of the experiment hook."}'
```
Expected: `{"ok":true,…}`.

- [ ] **Step 4: Confirm on the platform**

```bash
curl -s -X POST http://127.0.0.1:4000/v1/assign -H "x-api-key: <key>" -H "content-type: application/json" -d '{"user_id":"<value>","experiment_key":"portfolio-hero-cta"}'
```
Expected: `enrolled: true` and the `variant_key` matching the copy served. Then log in with the demo admin and `GET /api/v1/experiments/<id>/results` (Bearer JWT) or open the dashboard: the experiment shows ≥1 assignment and the two events (`hero_cta_click`, `contact_submitted`) for that user. If results need the analysis job, `POST /api/v1/experiments/<id>/analyze` first.

- [ ] **Step 5: Confirm the disabled path is unchanged**

Stop the server; `npm run start` with both vars unset; `curl -si http://localhost:3000/ | grep -ic "set-cookie: eh_uid"` → `0`, and the CTA reads "See the work". `npm run build` output lists `/` as `○`.

- [ ] **Step 6: Record and commit**

Append to the Experiments section of `DEPLOYMENT.md`:

```markdown
**Verified locally (2026-10-07):** against ExperimentHub at `127.0.0.1:4000` — cookie minted, variant served and sticky, CTA click and contact submit recorded as `hero_cta_click` / `contact_submitted` on the platform; with the variables unset the site served control, set no cookie, and `/` built static.
```

```bash
git add DEPLOYMENT.md
git commit -m "docs(experiments): record local end-to-end verification

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Self-review

- **Spec coverage.** §4 env/enablement → T1; §5 identity → T2, T4; §6 experiment/copy → T5, T8 (setup); §7 flow → T4, T5, T6, T7; §8 library + fail-open table → T3; §9 vendoring → T1; §10 setup script → T8; §11 copy → T8; §12 tests → every task; §13 gates → T5 Step 10, T8 Step 4, T9; §14 rulings → encoded in constraints.
- **Type consistency.** `ExperimentAssignment` (T3) is what `page.tsx` (T5) awaits; `readUid(source: UidSource)` (T2) is called with `NextRequest` in T6/T7 — `NextRequest.cookies.get` returns `RequestCookie | undefined` which structurally satisfies `{ value: string } | undefined`; `trackConversion(uid, key, event, options?)` signature identical in T3, T6, T7; `heroCtaCopy(string | undefined)` matches `ctaVariant?: string`.
- **Placeholders.** None: each code step is complete; T7's `postContact` is named as "the file's existing helper" with explicit instructions to extend it, and T8's envelope fallbacks are explicit.
