import { notFound } from "next/navigation";
import { generatePageMetadata, generateBreadcrumbJsonLd, generateArticleJsonLd } from "@/lib/metadata";
import { getAllBlogSlugs, getBlogPostBySlug, getAllBlogPosts } from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { MdxContent } from "@/components/case-study/MdxContent";
import { JsonLd } from "@/components/ui/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "./article.module.css";

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
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    ogType: "article",
    article: {
      publishedTime: post.date,
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
  const contentHtml = markdownToHtml(post.content);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ]);

  const articleJsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `/blog/${slug}`,
  });

  return (
    <div className={styles.page}>
      <JsonLd id="blog-article-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      <JsonLd id="blog-article-jsonld" data={articleJsonLd} />

      <ReadingProgress />

      {/* Article Header */}
      <ScrollReveal>
        <header className={styles.header}>
          <Badge variant="accent">{post.category}</Badge>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <ShareButtons title={post.title} url={`/blog/${slug}`} />
        </header>
      </ScrollReveal>

      {/* Article Content */}
      <ScrollReveal delay={0.1}>
        <article>
          <MdxContent html={contentHtml} />
        </article>
      </ScrollReveal>

      {/* Related Articles */}
      <ScrollReveal delay={0.1}>
        <div className={styles.relatedSection}>
          <RelatedArticles current={post} allPosts={allPosts} />
        </div>
      </ScrollReveal>

      {/* Back to Blog */}
      <nav className={styles.nav} aria-label="Blog navigation">
        <Button href="/blog" variant="secondary">
          ← Back to Blog
        </Button>
      </nav>
    </div>
  );
}
