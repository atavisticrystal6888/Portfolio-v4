import Link from "next/link";
import type { BlogArticle } from "@/types/blog";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatDate } from "@/lib/utils";
import styles from "./BlogTeaser.module.css";

interface BlogTeaserProps {
  posts: BlogArticle[];
  /** The total library count can exceed the curated posts shown on home. */
  totalCount: number;
}

export function BlogTeaser({ posts, totalCount }: BlogTeaserProps) {
  return (
    <>
      <ListRows>
        {posts.slice(0, 3).map((post) => (
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
      {totalCount > 0 && (
        <div className={styles.viewAll}>
          <Link href="/blog" className={styles.viewAllLink}>
            {/* One string, not JSX text: the compiler drops the space after
                the expression when the text node wraps to the next line. */}
            {`All ${totalCount} articles →`}
          </Link>
        </div>
      )}
    </>
  );
}
