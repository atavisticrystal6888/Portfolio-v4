import Link from "next/link";
import type { BlogArticle } from "@/types/blog";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import styles from "./BlogTeaser.module.css";

interface BlogTeaserProps {
  posts: BlogArticle[];
}

export function BlogTeaser({ posts }: BlogTeaserProps) {
  return (
    <div className={styles.grid}>
      {posts.slice(0, 3).map((post) => (
        <GlassCard key={post.slug} as="article" hover className={styles.card}>
          <Badge variant="accent">{post.category}</Badge>
          <div className={styles.meta}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <h3 className={styles.title}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </GlassCard>
      ))}
    </div>
  );
}
