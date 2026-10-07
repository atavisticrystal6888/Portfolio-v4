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
