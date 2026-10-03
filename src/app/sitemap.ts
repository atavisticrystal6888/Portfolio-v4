import type { MetadataRoute } from "next";
import {
  getAllBlogSlugs,
  getAllCaseStudySlugs,
  getBlogPostBySlug,
  getProjectBySlug,
} from "@/lib/content";
import { contentDate } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

/**
 * Canonical, indexable 200 routes only (the withdrawn and private content
 * folders are never read here).
 *
 * `lastmod` is only emitted where a real content date exists: a build-time
 * `new Date()` would claim every page changed on every deploy, and Google
 * learns to ignore a sitemap whose dates are consistently untrue.
 * - Static pages: no recorded edit date, so no lastmod.
 * - Case studies: `lastVerified` in content/projects.json (the date the facts
 *   on the entry were last checked and edited).
 * - Articles: `updatedDate ?? date` from the post frontmatter.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/projects`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/ai-pm`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${SITE_URL}/blog`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/contact`, priority: 0.7, changeFrequency: "yearly" },
    { url: `${SITE_URL}/now`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/lab`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/uses`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE_URL}/bookshelf`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE_URL}/changelog`, priority: 0.5, changeFrequency: "monthly" },
  ];

  const caseStudyRoutes: MetadataRoute.Sitemap = getAllCaseStudySlugs().map(
    (slug) => {
      const lastVerified = contentDate(getProjectBySlug(slug)?.lastVerified);
      return {
        url: `${SITE_URL}/projects/${slug}`,
        ...(lastVerified ? { lastModified: lastVerified } : {}),
        priority: 0.8,
        changeFrequency: "monthly" as const,
      };
    }
  );

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogSlugs().flatMap((slug) => {
    const post = getBlogPostBySlug(slug);
    if (!post) return [];
    const lastModified = contentDate(post.updatedDate) ?? contentDate(post.date);
    return [
      {
        url: `${SITE_URL}/blog/${slug}`,
        ...(lastModified ? { lastModified } : {}),
        priority: 0.7,
        changeFrequency: "monthly" as const,
      },
    ];
  });

  return [...staticRoutes, ...caseStudyRoutes, ...blogRoutes];
}
