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

  it("rejects prototype-chain keys and non-string events", async () => {
    const calls = stubFetch();
    for (const body of [{ event: "constructor" }, { event: "toString" }, { event: 1 }]) {
      expect((await post(JSON.stringify(body), `eh_uid=${UUID}`)).status).toBe(400);
    }
    expect((await post('{"event":"__proto__"}', `eh_uid=${UUID}`)).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("does not send an event for an un-enrolled visitor", async () => {
    const calls = stubFetch({ status: 200, body: { ...assignment, enrolled: false } });
    const res = await post(JSON.stringify({ event: "hero_cta_click" }), `eh_uid=${UUID}`);
    expect(res.status).toBe(204);
    expect(calls.map((c) => c.url)).toEqual(["http://hub.test/v1/assign"]);
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

  it("tracks an enrolled visitor's click, sends the idempotency key, and still answers 204", async () => {
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
