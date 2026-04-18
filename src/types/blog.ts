export interface BlogArticleFrontmatter {
  slug: string;
  title: string;
  date: string;
  updatedDate: string | null;
  category: "Product" | "Data" | "Career";
  tags: string[];
  readingTime: string;
  excerpt: string;
  socialImage: string | null;
}

export interface BlogArticle extends BlogArticleFrontmatter {
  content: string;
}
