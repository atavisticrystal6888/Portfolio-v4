import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/interactive/CustomCursor";
import { CommandPalette } from "@/components/interactive/CommandPalette";
import { AnimatedGradient } from "@/components/interactive/AnimatedGradient";
import { OnekoCat } from "@/components/interactive/OnekoCat";
import { ToastProvider } from "@/components/ui/Toast";
import { SkipLink } from "@/components/ui/SkipLink";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Dhruv Singhal — Product Manager & Builder",
    template: "%s | Dhruv Singhal",
  },
  description:
    "Portfolio of Dhruv Singhal — Product Manager & Builder. Aviation product management, AI diagnostics, churn prediction, and operational analytics. Blog on data-driven product thinking.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  keywords: [
    "Dhruv Singhal",
    "Product Manager",
    "Aviation PM",
    "Data Analytics",
    "AI PM",
    "Portfolio",
    "Case Studies",
    "APM",
  ],
  authors: [{ name: "Dhruv Singhal", url: "https://dhruvsinghal.codes" }],
  creator: "Dhruv Singhal",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dhruv Singhal",
    title: "Dhruv Singhal — Product Manager & Builder",
    description:
      "Aviation product management, AI diagnostics, and operational analytics.",
    images: [{ url: "/og/", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhruv Singhal — Product Manager & Builder",
    description:
      "Aviation product management, AI diagnostics, and operational analytics.",
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dhruv Singhal - Blog RSS"
          href="/rss.xml"
        />
        <meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f7f7f8" media="(prefers-color-scheme: light)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Dhruv Singhal",
              "url": "https://dhruvsinghal.codes",
              "jobTitle": "Product Manager & Builder",
              "description": "Early-career product manager turning ambiguous domain inputs into specs, metrics, and shipped systems across aviation, AI, and analytics.",
              "knowsAbout": ["Product Analytics", "Data Science", "AI/ML", "Product Management", "Python", "SQL", "Next.js"],
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "J.C. Bose University"
              },
              "sameAs": [
                "https://github.com/atavisticrystal6888",
                "https://linkedin.com/in/dhruvsinghal6888"
              ]
            }),
          }}
        />
      </head>
      <body>
        <ToastProvider>
          <LoadingScreen />
          <SkipLink />
          <ScrollProgress />
          <CustomCursor />
          <ErrorBoundary>
            <OnekoCat />
          </ErrorBoundary>
          <AnimatedGradient />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <CommandPalette />
        </ToastProvider>
        {process.env.VERCEL && <Analytics />}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
