import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DirectLinks } from "@/components/contact/DirectLinks";
import { generatePersonJsonLd } from "@/lib/metadata";
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "@/lib/site";

/**
 * The route reads RESEND_API_KEY and NODE_ENV at module scope, so each case
 * stubs the environment and re-imports rather than sharing one instance. The
 * in-memory rate-limit map is per-import too, which keeps the cases isolated.
 */
async function loadRoute(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key as "NODE_ENV", value);
  }
  const { NextRequest } = await import("next/server");
  const mod = await import("@/app/api/contact/route");
  const post = (body: unknown, ip: string) =>
    mod.POST(
      new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify(body),
      })
    );
  return post;
}

const VALID = {
  name: "Test User",
  email: "test@example.com",
  subject: "job",
  message: "A message comfortably longer than the twenty-character minimum.",
};

// Cold-importing next/server + resend costs several seconds on first use;
// the default 5s per-test budget is not a statement about this route.
describe("POST /api/contact", { timeout: 30_000 }, () => {
  beforeAll(async () => {
    await import("next/server");
    await import("resend");
  });

  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("silently drops a submission that filled the honeypot", async () => {
    const post = await loadRoute({ NODE_ENV: "development" });
    const res = await post({ ...VALID, website: "http://spam.example" }, "198.51.100.1");
    expect(res.status).toBe(200);
    // Indistinguishable from a genuine send: a bot must not be able to tell
    // the honeypot exists by comparing responses.
    const dropped = await res.json();
    const sent = await (await post(VALID, "198.51.100.2")).json();
    expect(dropped).toEqual(sent);
    expect(dropped.ok).toBe(true);
  });

  it("drops a honeypot submission before validation, not after", async () => {
    const post = await loadRoute({ NODE_ENV: "development" });
    // Invalid on every field, so a 200 can only come from the honeypot path.
    const res = await post({ name: "", email: "nope", subject: "", message: "x", website: "bot" }, "198.51.100.3");
    expect(res.status).toBe(200);
  });

  it("returns 503 in production when the Resend key is missing", async () => {
    const post = await loadRoute({ NODE_ENV: "production" });
    const res = await post(VALID, "198.51.100.4");
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe(
      "The contact form is temporarily offline — please email me directly."
    );
    expect(body.success).toBeUndefined();
  });

  it("validates before the offline check: a bad payload is 400, not 503", async () => {
    // A malformed request is invalid whatever the server's mail config is, and
    // a 503 would wrongly tell the sender to retry later.
    const post = await loadRoute({ NODE_ENV: "production" });
    const res = await post({ ...VALID, message: "too short" }, "198.51.100.7");
    expect(res.status).toBe(400);
  });

  it("keeps the console fallback and a 200 in development", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const post = await loadRoute({ NODE_ENV: "development" });
    const res = await post(VALID, "198.51.100.5");
    expect(res.status).toBe(200);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it("still validates normal submissions", async () => {
    const post = await loadRoute({ NODE_ENV: "development" });
    const res = await post({ ...VALID, message: "too short" }, "198.51.100.6");
    expect(res.status).toBe(400);
  });
});

describe("DirectLinks", () => {
  it("renders the phone as a tel: link with the grouped display number", () => {
    const html = renderToStaticMarkup(createElement(DirectLinks));
    expect(html).toContain(`href="${CONTACT_PHONE_HREF}"`);
    expect(html).toContain(CONTACT_PHONE_DISPLAY);
  });

  it("marks the copyable handles as polite live regions", () => {
    const html = renderToStaticMarkup(createElement(DirectLinks));
    // Email and phone only - the static handles would be announced on mount.
    expect(html.match(/aria-live="polite"/g)).toHaveLength(2);
  });

  it("lets the mailto: and tel: anchors navigate, with copying on its own button", () => {
    const html = renderToStaticMarkup(createElement(DirectLinks));
    // A tap on the tile must reach the dialler/mail app, so the anchors carry
    // no click handler and the copy affordance is a sibling button.
    expect(html).toContain('aria-label="Copy email address"');
    expect(html).toContain('aria-label="Copy phone number"');
    expect(html.match(/<button type="button"/g)).toHaveLength(2);
    // Buttons live outside the anchors: no nested interactive.
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>)[\s\S])*<button/);
  });
});

describe("Person JSON-LD", () => {
  it("publishes the E.164 telephone", () => {
    expect(generatePersonJsonLd().telephone).toBe(CONTACT_PHONE);
    expect(CONTACT_PHONE_HREF).toBe(`tel:${CONTACT_PHONE}`);
  });
});
