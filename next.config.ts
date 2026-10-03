import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // experimental.inlineCss is deliberately NOT enabled. A what-if run on
  // 2026-10-02 inlined this site's CSS (about 137 KB raw / 23 KB gzip per page:
  // a global sheet, not atomic CSS) into the HTML. On the cohort case study,
  // Lighthouse mobile went from FCP 1.85 s / LCP 3.80 s to FCP 2.85-2.90 s /
  // LCP 5.07-5.51 s across 3 runs, because the document nearly doubled and the
  // first paint came later. Next also duplicates inlined CSS in the RSC payload
  // on first load. Do not turn it on without a fresh before/after measurement.
  // Details: docs/audits/2026-10-02-performance.md, "Phase 2a changes".
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
