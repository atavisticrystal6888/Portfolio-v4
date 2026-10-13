import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/interactive/CommandPalette";
import { AnimatedGradient } from "@/components/interactive/AnimatedGradient";
import { ToastProvider } from "@/components/ui/Toast";
import { SkipLink } from "@/components/ui/SkipLink";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { JsonLd } from "@/components/ui/JsonLd";
import { generatePersonJsonLd } from "@/lib/metadata";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { THEME_COLOR } from "@/lib/theme-color";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "96x96", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  keywords: [
    "Dhruv Singhal",
    "Product Manager",
    "E-commerce PM",
    "Data Analytics",
    "AI PM",
    "Portfolio",
    "Case Studies",
    "APM",
    "Product Analytics",
    "SQL",
    "Python",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: absoluteUrl("/og"), width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/og")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Declared explicitly rather than leaning on Next's default so the contract is
// visible in the repo. No maximumScale / userScalable: pinch-zoom stays
// available, which a chunk of readers rely on.
// No themeColor here on purpose: a prefers-color-scheme pair turned phone
// chrome navy above a cream page for dark-OS visitors (the site renders light
// until the toggle is used). The inline script below owns the single
// theme-color meta instead, so it always matches the rendered theme.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = generatePersonJsonLd();

// Fonts are not preloaded. The three self-hosted faces in src/styles/base.css
// are discovered from CSS and swap in over per-weight, metric-fitted local
// fallbacks (Arial, Georgia, Courier New), so text paints at once and the swap
// does not move layout. Preloading them cost about 0.4 s of real-paint LCP on
// Slow 4G: the 80 KB of fonts competed with the render-blocking stylesheets.
// See docs/audits/2026-10-13-lcp-debug.md, "Font fallback fit".

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-palette="teal"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dhruv Singhal | Blog RSS"
          href="/rss.xml"
        />
        {/* Applies a STORED theme before first paint, so a returning visitor
            who chose dark (or another palette) never sees the default flash
            by until React hydrates. No stored choice means the working-paper
            light identity, deliberately ignoring the OS preference - keep
            that and the storage key in sync with src/hooks/useTheme.ts.
            It also writes the one <meta name="theme-color"> for the mode it
            applied. The meta is created here rather than rendered by React:
            React hydrates a <meta> by matching its content attribute, so a
            React-rendered meta whose content this script changed would be
            re-inserted beside it, leaving two. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m='light',p='teal',d=document;try{var s=localStorage.getItem('ds-portfolio-theme');var c=s?JSON.parse(s):null;if(c&&c.mode)m=c.mode;if(c&&c.palette)p=c.palette;}catch(e){}var e=d.documentElement;e.setAttribute('data-theme',m);e.setAttribute('data-palette',p);var t=d.querySelector('meta[name="theme-color"]');if(!t){t=d.createElement('meta');t.setAttribute('name','theme-color');d.head.appendChild(t);}t.setAttribute('content',m==='dark'?'${THEME_COLOR.dark}':'${THEME_COLOR.light}');})();`,
          }}
        />
        <JsonLd id="site-person-jsonld" data={personJsonLd} />
      </head>
      <body>
        {/* No MotionConfig wrapper any more: the drawer and the palette
            animate with CSS, which the reduced-motion media queries already
            cover, so framer-motion is out of the shared bundle. */}
        <ToastProvider>
          <SkipLink />
          <ScrollProgress />
          <AnimatedGradient />
          <Navbar />
          {/* tabIndex -1 so the skip link actually moves focus here, not just
              the scroll position. */}
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CommandPalette />
        </ToastProvider>
        {process.env.VERCEL && <Analytics />}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
