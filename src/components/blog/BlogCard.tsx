import { ListRow } from "@/components/ui/ListRow";
import { formatDate } from "@/lib/utils";
import type { BlogArticle } from "@/types/blog";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: BlogArticle;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <ListRow
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
      trailing={
        post.tags.length > 0 ? (
          <p className={styles.tags}>{post.tags.join(" · ")}</p>
        ) : undefined
      }
    />
  );
}
