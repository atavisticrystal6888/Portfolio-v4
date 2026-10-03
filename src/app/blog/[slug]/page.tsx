import { notFound } from "next/navigation";
import { generatePageMetadata, generateArticleJsonLd } from "@/lib/metadata";
import { getAllBlogSlugs, getBlogPostBySlug, getAllBlogPosts } from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { TableOfContents, type TOCItem } from "@/components/blog/TableOfContents";
import proseStyles from "@/components/case-study/MdxContent.module.css";
import { JsonLd } from "@/components/ui/JsonLd";
import styles from "./article.module.css";

/** Posts with at least this many h2s get an "On this page" list. */
const TOC_MIN_H2 = 4;

/** Every slug is known at build time; anything else (or a case variant) 404s. */
export const dynamicParams = false;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * Gives every rendered h2/h3 a stable, unique id and returns the list for the
 * table of contents. Done here on the server so the ids and the list are in
 * the first paint; the markdown renderer itself emits bare headings.
 */
function withHeadingIds(html: string): { html: string; headings: TOCItem[] } {
  const used = new Set<string>();
  const headings: TOCItem[] = [];
  const out = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const text = inner
        .replace(/<[^>]+>/g, "")
        .replace(/&(amp|lt|gt|quot|#39);/g, (e) => ENTITIES[e] ?? e)
        .trim();
      const base = slugify(text) || "section";
      let id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      headings.push({ id, text, level: level === "2" ? 2 : 3 });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );
  // Wide tables scroll inside their own focusable region instead of pushing
  // past a 320px viewport.
  const wrapped = out
    .replace(
      /<table>/g,
      '<div data-table-scroll tabindex="0" role="group" aria-label="Table, scrolls sideways"><table>'
    )
    .replace(/<\/table>/g, "</table></div>");
  return { html: wrapped, headings };
}

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return generatePageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    path: `/blog/${slug}`,
    ogType: "article",
    article: {
      publishedTime: post.date,
      modifiedTime: post.updatedDate ?? post.date,
      // The helper maps the site owner's name to the absolute /about URL.
      author: "Dhruv Singhal",
    },
  });
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const { html: contentHtml, headings } = withHeadingIds(markdownToHtml(post.content));
  const showToc = headings.filter((h) => h.level === 2).length >= TOC_MIN_H2;
  const updated = post.updatedDate && post.updatedDate !== post.date ? post.updatedDate : null;

  // The helper's author (generateAuthorPerson) already carries /about and
  // the LinkedIn/GitHub sameAs, matching the bio below.
  const articleJsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.metaDescription ?? post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedDate,
    url: `/blog/${slug}`,
  });

  return (
    <div className={styles.page}>
      <JsonLd id="blog-article-jsonld" data={articleJsonLd} />

      {/* Reading progress comes from the site-wide ScrollProgress in the
          root layout; a second per-article bar drew on top of it. */}

      {/* Article Header */}
      <header className={styles.header}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: post.title, href: `/blog/${slug}` },
            ]}
          />
        </div>
        <p className={styles.eyebrow}>{post.category}</p>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {updated && (
            <>
              <span className={styles.sep} aria-hidden="true">&middot;</span>
              <span data-testid="article-updated">
                Updated <time dateTime={updated}>{formatDate(updated)}</time>
              </span>
            </>
          )}
          <span className={styles.sep} aria-hidden="true">&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        {post.tags.length > 0 && (
          <ul className={styles.tags} aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}
        <ShareButtons title={post.title} url={`/blog/${slug}`} />
      </header>

      {/* Article: "On this page" disclosure above it below 1200px, a sticky
          list beside it from 1200px. Short posts get neither. */}
      {showToc && <TableOfContents items={headings} variant="inline" />}
      <div className={styles.body}>
        {showToc && <TableOfContents items={headings} className={styles.toc} />}
        <article className={styles.article}>
          {/* Server-rendered prose with the shared .prose styles. Going through
              the client LegacyHtmlContent shipped this HTML twice (markup plus
              the serialised prop), only for a gallery lightbox that no blog
              post uses. */}
          <div className={proseStyles.prose} dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
      </div>

      {/* Author bio, outside <article> so it never joins the section list */}
      <div className={styles.authorSection}>
        <AuthorBio />
      </div>

      {/* Related Articles */}
      <div className={styles.relatedSection}>
        <RelatedArticles current={post} allPosts={allPosts} />
      </div>

      {/* Back to Blog */}
      <nav className={styles.nav} aria-label="Blog navigation">
        <Button href="/blog" variant="secondary">
          <span aria-hidden="true">&larr;</span> Back to Blog
        </Button>
      </nav>
    </div>
  );
}
