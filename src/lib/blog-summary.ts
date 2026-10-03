import type { BlogArticle, BlogArticleFrontmatter } from "@/types/blog";

/** A post without its MDX body: what index lists and client components need. */
export type BlogSummary = BlogArticleFrontmatter;

/**
 * Drop the raw MDX `content` before a post crosses into a client component.
 * Passing whole posts serialised every article body (~77 KB) into the HTML of
 * the home page and /blog, although nothing there reads it.
 */
export function toBlogSummary(post: BlogArticle): BlogSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, ...summary } = post;
  return summary;
}
