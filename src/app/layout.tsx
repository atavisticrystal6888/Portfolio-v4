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

export const metadata: Metadata = {
  title: "Dhruv Singhal — Product Analyst & Builder",
  description:
    "Portfolio of Dhruv Singhal — Product Analyst & Builder. Case studies, blog articles, and projects showcasing data-driven product thinking.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
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
          href="/fonts/satoshi-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/boska-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dhruv Singhal — Blog RSS"
          href="/rss.xml"
        />
        <meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f7f7f8" media="(prefers-color-scheme: light)" />
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
        <Analytics />
      </body>
    </html>
  );
}
