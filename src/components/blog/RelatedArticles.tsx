import type { BlogArticle } from "@/types/blog";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatDate } from "@/lib/utils";
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
      <h2 className={styles.heading}>Related reading</h2>
      <ListRows>
        {related.map(({ post }) => (
          <ListRow
            key={post.slug}
            href={`/blog/${post.slug}`}
            title={post.title}
            dek={post.excerpt}
            rail={
              <>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>
                  {post.category} &middot; {post.readingTime}
                </span>
              </>
            }
          />
        ))}
      </ListRows>
    </section>
  );
}
