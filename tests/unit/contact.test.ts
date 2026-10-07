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
  // Hooks have their own 10s default that the describe timeout does not lift;
  // on a fresh install (CI) the cold import alone exceeded it.
  beforeAll(async () => {
    await import("next/server");
    await import("resend");
  }, 60_000);

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

  describe("with Resend configured", () => {
    // resend v6 resolves { data, error } instead of throwing, so a rejected
    // send (bad key, unverified sender, sandbox recipient limit) only shows up
    // in the result. The SDK is mocked: nothing is sent.
    const send = vi.fn();
    beforeEach(() => {
      send.mockReset();
      vi.doMock("resend", () => ({
        Resend: class {
          emails = { send };
        },
      }));
    });
    afterEach(() => {
      vi.doUnmock("resend");
    });
    const SEND_FAILED = "The message could not be sent — please email me directly.";

    it("answers 200 only after Resend accepts the message", async () => {
      send.mockResolvedValue({ data: { id: "email_123" }, error: null });
      const post = await loadRoute({ NODE_ENV: "production", RESEND_API_KEY: "re_test" });
      const res = await post(VALID, "198.51.100.8");
      expect(res.status).toBe(200);
      expect(send).toHaveBeenCalledWith(expect.objectContaining({ replyTo: VALID.email }));
    });

    it("reports a rejected send as 502, never as success", async () => {
      send.mockResolvedValue({
        data: null,
        error: { name: "validation_error", message: "You can only send testing emails to your own address" },
      });
      const err = vi.spyOn(console, "error").mockImplementation(() => {});
      const post = await loadRoute({ NODE_ENV: "production", RESEND_API_KEY: "re_test" });
      const res = await post(VALID, "198.51.100.9");
      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toBe(SEND_FAILED);
      expect(body.success).toBeUndefined();
      err.mockRestore();
    });

    it("reports a thrown send (network) as 502, not as a bad request", async () => {
      send.mockRejectedValue(new Error("fetch failed"));
      const err = vi.spyOn(console, "error").mockImplementation(() => {});
      const post = await loadRoute({ NODE_ENV: "production", RESEND_API_KEY: "re_test" });
      const res = await post(VALID, "198.51.100.10");
      expect(res.status).toBe(502);
      expect((await res.json()).error).toBe(SEND_FAILED);
      err.mockRestore();
    });

    describe("send-failure logging is bounded", () => {
      // Synthetic probe values: if any of these reach console.error, a send
      // failure would have copied visitor or provider text into Vercel logs.
      const PROBE = {
        name: "Leak Probe",
        email: "leak-probe@example.test",
        subject: "job",
        message: "Probe body SENSITIVE-PAYLOAD-7f3a, comfortably over twenty characters.",
      };
      const FORBIDDEN = [
        "Leak Probe",
        "leak-probe@example.test",
        "SENSITIVE",
        "PAYLOAD-7f3a",
        "Probe body",
        "You can only send",
        "owner@example.test",
        "cause",
        "stack",
        "at sendMail",
        "/srv/app",
        "etc/passwd",
        "<script>",
      ];
      const SUMMARY_KEYS = ["name", "requestId", "source", "statusCode"];

      async function failAndCapture(ip: string, sendError: unknown) {
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
          const post = await loadRoute({ NODE_ENV: "production", RESEND_API_KEY: "re_test" });
          const res = await post(PROBE, ip);
          expect(res.status).toBe(502);
          const body = await res.json();
          expect(body.error).toBe(SEND_FAILED);
          expect(body.success).toBeUndefined();

          const calls = err.mock.calls;
          expect(calls).toHaveLength(1);
          const args = calls[0] ?? [];
          expect(args).toHaveLength(2);
          const [label, summary] = args as [unknown, Record<string, unknown>];
          expect(typeof label).toBe("string");
          expect(summary).not.toBeNull();
          expect(typeof summary).toBe("object");
          expect(summary).not.toBe(sendError);
          expect(Object.keys(summary).sort()).toEqual(SUMMARY_KEYS);
          for (const value of Object.values(summary)) {
            expect(value === null || typeof value === "string" || typeof value === "number").toBe(true);
          }
          const logged = JSON.stringify(calls) + " " + args.map((a) => String(a)).join(" ");
          for (const needle of FORBIDDEN) {
            expect(logged.includes(needle), `log must not contain ${JSON.stringify(needle)}`).toBe(false);
          }
          return summary;
        } finally {
          err.mockRestore();
        }
      }

      it("logs only the allow-listed name, numeric status and request id of a returned error", async () => {
        const error = {
          name: "validation_error",
          statusCode: 403,
          message: "You can only send to leak-probe@example.test (SENSITIVE-PROVIDER-TEXT)",
          email: "leak-probe@example.test",
          request: { to: "owner@example.test" },
        };
        send.mockResolvedValue({ data: null, error, headers: { "x-request-id": "req_abc-123" } });
        const summary = await failAndCapture("198.51.100.20", error);
        expect(summary).toEqual({
          source: "resend",
          name: "validation_error",
          statusCode: 403,
          requestId: "req_abc-123",
        });
        // The payload really reached the provider call, so the clean log is
        // the route's doing, not an empty request.
        expect(send).toHaveBeenCalledTimes(1);
        const sent = send.mock.calls[0]?.[0] as { replyTo?: string; text?: string } | undefined;
        expect(sent?.replyTo).toBe("leak-probe@example.test");
        expect(sent?.text).toContain("PAYLOAD-7f3a");
      });

      it("collapses an unknown name, out-of-range status and malformed request id", async () => {
        const error = {
          name: "totally_made_up",
          statusCode: 99999,
          message: "Recipient leak-probe@example.test rejected SENSITIVE-PROVIDER-TEXT",
        };
        send.mockResolvedValue({
          data: null,
          error,
          headers: { "x-request-id": "../etc/passwd <script>" },
        });
        expect(await failAndCapture("198.51.100.21", error)).toEqual({
          source: "resend",
          name: "unrecognized",
          statusCode: null,
          requestId: null,
        });
      });

      it("drops a non-numeric status code", async () => {
        const error = {
          name: "application_error",
          statusCode: "403",
          message: "Upstream said leak-probe@example.test SENSITIVE-PROVIDER-TEXT",
        };
        send.mockResolvedValue({ data: null, error, headers: null });
        expect(await failAndCapture("198.51.100.22", error)).toEqual({
          source: "resend",
          name: "application_error",
          statusCode: null,
          requestId: null,
        });
      });

      it("logs a thrown error by class name only, never message, cause or stack", async () => {
        const thrown = new TypeError("fetch failed: leak-probe@example.test SENSITIVE-THROWN");
        Object.assign(thrown, {
          cause: { message: "SENSITIVE-CAUSE", email: "leak-probe@example.test" },
        });
        thrown.stack = "TypeError: fetch failed SENSITIVE-STACK\n    at sendMail (/srv/app/route.ts:1:1)";
        send.mockRejectedValue(thrown);
        expect(await failAndCapture("198.51.100.23", thrown)).toEqual({
          source: "thrown",
          name: "TypeError",
          statusCode: null,
          requestId: null,
        });
      });

      it("logs a thrown non-Error as unknown", async () => {
        const rejection = "SENSITIVE-STRING-REJECTION leak-probe@example.test";
        send.mockRejectedValue(rejection);
        expect(await failAndCapture("198.51.100.24", rejection)).toEqual({
          source: "unknown",
          name: "unrecognized",
          statusCode: null,
          requestId: null,
        });
      });

      it("does not echo a thrown error whose name was overwritten with free text", async () => {
        const thrown = new Error("SENSITIVE-NAMED leak-probe@example.test");
        thrown.name = "Evil name with spaces leak-probe@example.test";
        send.mockRejectedValue(thrown);
        expect(await failAndCapture("198.51.100.25", thrown)).toEqual({
          source: "thrown",
          name: "unrecognized",
          statusCode: null,
          requestId: null,
        });
      });

      it("still 502s and logs a null status for an error without statusCode or headers", async () => {
        const error = {
          name: "validation_error",
          message: "You can only send testing emails to your own address",
        };
        send.mockResolvedValue({ data: null, error });
        expect(await failAndCapture("198.51.100.26", error)).toEqual({
          source: "resend",
          name: "validation_error",
          statusCode: null,
          requestId: null,
        });
      });
    });
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
