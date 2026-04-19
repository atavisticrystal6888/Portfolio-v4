import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { getAllBlogPosts } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { JsonLd } from "@/components/ui/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
      <JsonLd id="blog-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      <PageHeader
        title="Thoughts on Product, Data & Building"
        subtitle="Lessons from product thinking and technical execution."
      />

      <ScrollReveal>
        <BlogSearch posts={posts} />
      </ScrollReveal>
    </>
  );
}
