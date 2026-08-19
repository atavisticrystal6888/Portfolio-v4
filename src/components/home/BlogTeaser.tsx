import Link from "next/link";
import type { BlogArticle } from "@/types/blog";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatDate } from "@/lib/utils";
import styles from "./BlogTeaser.module.css";

interface BlogTeaserProps {
  posts: BlogArticle[];
}

export function BlogTeaser({ posts }: BlogTeaserProps) {
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
      {posts.length > 3 && (
        <div className={styles.viewAll}>
          <Link href="/blog" className={styles.viewAllLink}>
            All {posts.length} articles &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
