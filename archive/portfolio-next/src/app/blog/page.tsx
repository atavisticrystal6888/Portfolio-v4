import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { getAllBlogPosts } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";

export const metadata = generatePageMetadata({
  title: "Blog",
  description:
    "Thoughts on product management, data analytics, and building — by Dhruv Singhal.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHeader
        title="Thoughts on Product, Data & Building"
        subtitle="Lessons from product thinking and technical execution."
      />

      <BlogSearch posts={posts} />

      <div style={{ maxWidth: "var(--container-md)", margin: "var(--space-10) auto 0", padding: "0 var(--space-6)" }}>
        <NewsletterSignup />
      </div>
    </>
  );
}
