import type { Project } from "@/types/project";
import type { BlogArticle } from "@/types/blog";
import type { UserBehavior } from "@/types/theme";

interface ScoredItem {
  slug: string;
  title: string;
  type: "project" | "blog";
  category: string;
  score: number;
  href: string;
  description: string;
}

export function scoreSuggestions(
  projects: Project[],
  posts: BlogArticle[],
  behavior: UserBehavior
): ScoredItem[] {
  const visitedSlugs = new Set(behavior.pagesVisited.map((v) => v.slug));
  const totalAffinity = Object.values(behavior.categoryAffinities).reduce((a, b) => a + b, 0) || 1;

  const items: ScoredItem[] = [];

  for (const p of projects) {
    const catAffinity = (behavior.categoryAffinities[p.category] || 0) / totalAffinity;
    const unvisited = visitedSlugs.has(p.slug) ? 0 : 0.2;
    const score = catAffinity * 0.4 + unvisited + (p.featured ? 0.3 : 0.1);
    items.push({
      slug: p.slug,
      title: p.name,
      type: "project",
      category: p.category,
      score,
      href: `/projects/${p.slug}`,
      description: p.description,
    });
  }

  for (const post of posts) {
    const catAffinity = (behavior.categoryAffinities[post.category.toLowerCase()] || 0) / totalAffinity;
    const unvisited = visitedSlugs.has(post.slug) ? 0 : 0.2;
    const score = catAffinity * 0.4 + unvisited + 0.1;
    items.push({
      slug: post.slug,
      title: post.title,
      type: "blog",
      category: post.category,
      score,
      href: `/blog/${post.slug}`,
      description: post.excerpt,
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 4);
}
