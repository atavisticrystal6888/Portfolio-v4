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
