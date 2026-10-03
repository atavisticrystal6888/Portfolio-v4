import { generatePageMetadata } from "@/lib/metadata";
import { getAllBlogPosts } from "@/lib/content";
import { toBlogSummary } from "@/lib/blog-summary";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { WhereNext, DESTINATIONS } from "@/components/ui/WhereNext";

export const metadata = generatePageMetadata({
  title: "Blog",
  description:
    "Essays by Dhruv Singhal on product management: AI evaluation, retention cohorts, metrics, scoping and shipping, drawn from his own builds and internships.",
  path: "/blog",
});

export default function BlogPage() {
  // Summaries only: BlogSearch is a client component and never reads the
  // MDX body, so shipping it would only bloat the page's HTML.
  const posts = getAllBlogPosts().map(toBlogSummary);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
        title="Thoughts on Product, Data & Building"
        subtitle="Lessons from product thinking and technical execution."
        meta={`${posts.length} articles · newest first`}
      />

      <BlogSearch posts={posts} />

      <WhereNext
        destinations={[DESTINATIONS.projects, DESTINATIONS.aiPm, DESTINATIONS.contact]}
      />
    </>
  );
}
