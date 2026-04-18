import Link from "next/link";
import type { BlogArticle } from "@/types/blog";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./RelatedArticles.module.css";

interface RelatedArticlesProps {
  current: BlogArticle;
  allPosts: BlogArticle[];
}

export function RelatedArticles({ current, allPosts }: RelatedArticlesProps) {
  const related = allPosts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const tagOverlap = p.tags.filter((t) => current.tags.includes(t)).length;
      const catMatch = p.category === current.category ? 2 : 0;
      return { post: p, score: tagOverlap + catMatch };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-label="Related articles">
      <h3 className={styles.heading}>Related Articles</h3>
      <div className={styles.grid}>
        {related.map(({ post }) => (
          <GlassCard key={post.slug} as="article" hover className={styles.card}>
            <Badge variant="accent">{post.category}</Badge>
            <h4 className={styles.title}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h4>
            <p className={styles.excerpt}>{post.excerpt}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
