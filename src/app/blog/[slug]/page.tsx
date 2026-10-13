import { notFound } from "next/navigation";
import { generatePageMetadata, generateArticleJsonLd } from "@/lib/metadata";
import { getAllBlogSlugs, getBlogPostBySlug, getAllBlogPosts } from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, formatTagLabel, slugify } from "@/lib/utils";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { PageHeader } from "@/components/ui/PageHeader";
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
  const position = allPosts.findIndex((p) => p.slug === post.slug);
  const newer = position > 0 ? allPosts[position - 1] : undefined;
  const older = position >= 0 ? allPosts[position + 1] : undefined;
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

      {/* Article header: the shared PageHeader on the 760px reading column,
          so the crumb, h1 scale, gradient band and hairline match every
          index page while the left edge matches the article body. */}
      <PageHeader
        as="header"
        width="narrow"
        innerClassName={styles.header}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${slug}` },
        ]}
        eyebrow={post.category}
        title={post.title}
      >
        <div className={styles.facts}>
          {/* Separators are drawn in CSS (.metaItem::before) and clipped at
              the start of each line, so a wrapped row never strands a "·". */}
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <time dateTime={post.date}>{formatDate(post.date, "short")}</time>
            </span>
            {updated && (
              <span className={styles.metaItem} data-testid="article-updated">
                Updated <time dateTime={updated}>{formatDate(updated, "short")}</time>
              </span>
            )}
            <span className={styles.metaItem}>{post.readingTime}</span>
          </div>
          {post.tags.length > 0 && (
            <ul className={styles.tags} aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {formatTagLabel(tag)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <ShareButtons title={post.title} url={`/blog/${slug}`} />
      </PageHeader>

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

      {/* Previous / All articles / Next, the same end-of-page navigation as
          a case study. Posts are listed newest first, so "Previous" is the
          older post and "Next" the newer one; the ends do not wrap. */}
      <CaseStudyNav
        basePath="/blog"
        indexHref="/blog"
        indexLabel="All articles"
        label="Article navigation"
        prevSlug={older?.slug}
        prevName={older?.title}
        nextSlug={newer?.slug}
        nextName={newer?.title}
      />
    </div>
  );
}
