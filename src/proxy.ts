import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_HOST, SITE_URL, WWW_SITE_HOST } from "@/lib/site";

export function proxy(request: NextRequest) {
  const requestHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (requestHost === WWW_SITE_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = SITE_HOST;
    redirectUrl.protocol = new URL(SITE_URL).protocol;

    return NextResponse.redirect(redirectUrl, 308);
  }

  const response = NextResponse.next();

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