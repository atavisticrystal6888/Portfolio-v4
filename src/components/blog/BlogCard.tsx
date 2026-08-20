import { ListRow } from "@/components/ui/ListRow";
import { formatDate } from "@/lib/utils";
import type { BlogArticle } from "@/types/blog";

interface BlogCardProps {
  post: BlogArticle;
}

/**
 * Index row for a post. Tags are deliberately not shown here: the rail
 * already carries date, category and reading time, and five all-caps mono
 * tags under every dek turned the index into a wall of labels. They are
 * still indexed - BlogSearch matches on them, and the post page shows them.
 */
export function BlogCard({ post }: BlogCardProps) {
  return (
    <ListRow
      href={`/blog/${post.slug}`}
      title={post.title}
      // Index rows sit directly under the page h1, so they are h2 here.
      headingLevel={2}
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
  );
}
