import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
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
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1322" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
  ],
};

const personJsonLd = generatePersonJsonLd();

// The three self-hosted faces in src/styles/base.css are all used above the
// fold on every route (Manrope body copy, Fraunces h1, JetBrains Mono eyebrow
// / badge / tag labels), so all three are preloaded, once each. React dedupes
// preload() by href and emits a single <link rel="preload"> at the top of
// <head>. Keep the hrefs in sync with the @font-face src URLs or the preload
// is wasted (and Chrome warns that it went unused).
const FONT_PRELOADS = [
  "/fonts/manrope-variable.woff2",
  "/fonts/fraunces-variable.woff2",
  "/fonts/jetbrains-mono-latin.woff2",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  for (const href of FONT_PRELOADS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html
      lang="en"
      data-theme="light"
      data-palette="teal"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Font preloads come from the preload() calls above, not <link>
            tags: React 19 hoisted the old JSX tags AND kept them in place,
            so every page shipped each font preload twice. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dhruv Singhal — Blog RSS"
          href="/rss.xml"
        />
        {/* theme-color now ships from the `viewport` export above. */}
        {/* Applies a STORED theme before first paint, so a returning visitor
            who chose dark (or another palette) never sees the default flash
            by until React hydrates. No stored choice means the working-paper
            light identity, deliberately ignoring the OS preference - keep
            that and the storage key in sync with src/hooks/useTheme.ts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('ds-portfolio-theme');var c=s?JSON.parse(s):null;var m=c&&c.mode?c.mode:'light';var p=c&&c.palette?c.palette:'teal';var e=document.documentElement;e.setAttribute('data-theme',m);e.setAttribute('data-palette',p);}catch(e){}})();`,
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
