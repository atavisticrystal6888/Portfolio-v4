import { getAllBlogPosts, getAllProjects } from "@/lib/content";
import { CommandPaletteClient } from "./CommandPaletteClient";

/**
 * Server wrapper: reads the published case studies and articles at build
 * time and hands the client palette a small index (no MDX bodies). Only
 * entries in content/projects.json with a case-study page, and only posts in
 * content/blog, are listed, so withdrawn or private work can never appear.
 */
export function CommandPalette() {
  const caseStudies = getAllProjects()
    .filter((p) => p.hasCaseStudy !== false)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      keywords: [p.category, p.tagline, ...p.stack].filter(Boolean).join(" "),
    }));

  const posts = getAllBlogPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    keywords: [post.category, ...post.tags].join(" "),
  }));

  return <CommandPaletteClient caseStudies={caseStudies} posts={posts} />;
}
