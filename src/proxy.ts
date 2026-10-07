import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_HOST, SITE_URL, WWW_SITE_HOST } from "@/lib/site";

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

export function proxy(request: NextRequest) {
  const requestHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (requestHost === WWW_SITE_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = SITE_HOST;
    redirectUrl.protocol = new URL(SITE_URL).protocol;

    return NextResponse.redirect(redirectUrl, 308);
  }

  const response = experimentsEnabled() ? withExperimentIdentity(request) : NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // CSP - permissive enough for Three.js, inline styles (Next.js), and CDN fonts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!_next/static|_next/image|images|fonts|audio|resume).*)",
  ],
};