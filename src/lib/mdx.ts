import type { ReactElement } from "react";
import type { MDXComponents } from "mdx/types";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/**
 * Real MDX for case studies (content/case-studies/*.mdx).
 *
 * Frontmatter is already stripped by src/lib/content.ts (gray-matter), so the
 * `source` here is the body only. remark-gfm keeps pipe tables / task lists /
 * autolinks working; rehype-slug gives every heading a stable id so the
 * chapter rail can deep-link to it.
 *
 * Blog posts still go through the regex converter in src/lib/markdown.ts.
 */
export async function compileCaseStudyMdx(
  source: string,
  components: MDXComponents
): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });
  return content;
}
