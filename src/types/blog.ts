export interface BlogArticleFrontmatter {
  slug: string;
  title: string;
  date: string;
  /** Last material edit (ISO date). Shown as "Updated" and sent as dateModified. */
  updatedDate: string | null;
  category: "Product" | "Data" | "Career" | "AI";
  tags: string[];
  /**
   * Computed from the body by getBlogPostBySlug (see READING_WPM in
   * src/lib/content.ts); not read from frontmatter.
   */
  readingTime: string;
  excerpt: string;
  socialImage: string | null;
  /** Optional <title> override when the display title is too long for search. */
  seoTitle?: string;
  /** Optional meta description (120–160 chars) when the excerpt does not fit. */
  metaDescription?: string;
  /** Curated "Related reading" slugs, in order; falls back to tag scoring. */
  related?: string[];
}

export interface BlogArticle extends BlogArticleFrontmatter {
  content: string;
}
