import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/interactive/CommandPalette";
import { AnimatedGradient } from "@/components/interactive/AnimatedGradient";
import { ToastProvider } from "@/components/ui/Toast";
import { SkipLink } from "@/components/ui/SkipLink";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { JsonLd } from "@/components/ui/JsonLd";
import { MotionPrefs } from "@/components/ui/MotionPrefs";
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

const personJsonLd = generatePersonJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-palette="teal"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href="/fonts/manrope-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/fraunces-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dhruv Singhal — Blog RSS"
          href="/rss.xml"
        />
        <meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f7f7f8" media="(prefers-color-scheme: light)" />
        {/* Applies the stored theme before first paint. Without this the HTML
            ships as dark/teal and a returning visitor on light (or any other
            palette) sees the default flash by until React hydrates. Keep the
            storage key and shape in sync with src/hooks/useTheme.ts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('ds-portfolio-theme');var c=s?JSON.parse(s):null;var m=c&&c.mode?c.mode:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var p=c&&c.palette?c.palette:'teal';var e=document.documentElement;e.setAttribute('data-theme',m);e.setAttribute('data-palette',p);}catch(e){}})();`,
          }}
        />
        <JsonLd id="site-person-jsonld" data={personJsonLd} />
      </head>
      <body>
        <MotionPrefs>
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
        </MotionPrefs>
        {process.env.VERCEL && <Analytics />}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
