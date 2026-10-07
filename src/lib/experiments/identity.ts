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
