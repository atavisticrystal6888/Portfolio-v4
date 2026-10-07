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
