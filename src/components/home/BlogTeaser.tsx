import Link from "next/link";
import type { BlogArticle } from "@/types/blog";
import { formatDate } from "@/lib/utils";
import styles from "./BlogTeaser.module.css";

interface BlogTeaserProps {
  posts: BlogArticle[];
}

export function BlogTeaser({ posts }: BlogTeaserProps) {
  return (
    <>
      <ul className={styles.list}>
        {posts.slice(0, 3).map((post) => (
          <li key={post.slug} className={styles.item}>
            <Link href={`/blog/${post.slug}`} className={styles.row}>
              <div className={styles.rail}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>
                  {post.category} &middot; {post.readingTime}
                </span>
              </div>
              <div className={styles.body}>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.dek}>{post.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
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
