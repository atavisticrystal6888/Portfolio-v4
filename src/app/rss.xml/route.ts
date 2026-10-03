import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/content";
import { contentDate } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date for RSS from a content date (`YYYY-MM-DD`), or undefined. */
function rssDate(value: unknown): string | undefined {
  const day = contentDate(value);
  if (!day) return undefined;
  const parsed = new Date(day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toUTCString();
}

export async function GET() {
  // Iterate file slugs (the routed URLs), never the withdrawn/private folders.
  const posts = getAllBlogSlugs()
    .map((slug) => {
      const post = getBlogPostBySlug(slug);
      if (!post) return null;
      const published = contentDate(post.date);
      if (!published) return null;
      const updated = contentDate(post.updatedDate);
      return {
        slug,
        post,
        published,
        // The latest true content date: an edit date only when one is recorded.
        lastChanged: updated && updated > published ? updated : published,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.published.localeCompare(a.published));

  const items = posts
    .map(({ slug, post, published }) => {
      const url = `${SITE_URL}/blog/${slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rssDate(published)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join("\n");

  // lastBuildDate = the newest real publish/edit date, not the build clock.
  const newest = posts.map((p) => p.lastChanged).sort().at(-1);
  const lastBuildDate = newest ? `\n    <lastBuildDate>${rssDate(newest)}</lastBuildDate>` : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dhruv Singhal — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Thoughts on product, data, and building AI-native software.</description>
    <language>en-us</language>${lastBuildDate}
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
