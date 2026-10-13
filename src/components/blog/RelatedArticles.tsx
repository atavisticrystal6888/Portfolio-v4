import type { BlogArticle } from "@/types/blog";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatDate } from "@/lib/utils";
import { pickRelatedPosts } from "@/lib/content";
import styles from "./RelatedArticles.module.css";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface RelatedArticlesProps {
  current: BlogArticle;
  allPosts: BlogArticle[];
}

export function RelatedArticles({ current, allPosts }: RelatedArticlesProps) {
  const related = pickRelatedPosts(current, allPosts).map((post) => ({ post }));

  if (related.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-labelledby="related-reading-heading">
      <div className={styles.heading}>
        <SectionLabel as="h2" id="related-reading-heading">
          Related reading
        </SectionLabel>
      </div>
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
