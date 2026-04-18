import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import type { BlogArticle } from "@/types/blog";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: BlogArticle;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <GlassCard as="article" hover className={styles.card}>
      <div className={styles.meta}>
        <Badge variant="accent">{post.category}</Badge>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className={styles.dot}>·</span>
        <span>{post.readingTime}</span>
      </div>
      <h3 className={styles.title}>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <div className={styles.tags}>
        {post.tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>
    </GlassCard>
  );
}
