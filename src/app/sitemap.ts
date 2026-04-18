import type { MetadataRoute } from "next";
import { getAllCaseStudySlugs, getAllBlogSlugs } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/ai-pm`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), priority: 0.7 },
    { url: `${SITE_URL}/now`, lastModified: new Date(), priority: 0.6 },
    { url: `${SITE_URL}/lab`, lastModified: new Date(), priority: 0.6 },
    { url: `${SITE_URL}/uses`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/bookshelf`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/changelog`, lastModified: new Date(), priority: 0.5 },
  ];

  const caseStudyRoutes: MetadataRoute.Sitemap = getAllCaseStudySlugs().map(
    (slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })
  );

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...staticRoutes, ...caseStudyRoutes, ...blogRoutes];
}
