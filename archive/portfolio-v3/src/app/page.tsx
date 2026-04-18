import { generatePageMetadata, generatePersonJsonLd, generateWebSiteJsonLd } from "@/lib/metadata";
import { getAllProjects } from "@/lib/content";
import { getAllBlogPosts, getAllTestimonials } from "@/lib/content";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { HeroVisuals } from "@/components/home/HeroVisuals";
import { HeroSection } from "@/components/home/HeroSection";
import { MetricsGrid } from "@/components/home/MetricsGrid";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import styles from "./home.module.css";

export const metadata = generatePageMetadata({
  title: "Dhruv Singhal — Product Analyst & Builder",
  description:
    "Portfolio of Dhruv Singhal — Product Analyst & Builder. Case studies, blog articles, and projects showcasing data-driven product thinking.",
});

export default function Home() {
  const projects = getAllProjects().filter((p) => p.featured);
  const posts = getAllBlogPosts();
  const testimonials = getAllTestimonials();
  const personJsonLd = generatePersonJsonLd();
  const webSiteJsonLd = generateWebSiteJsonLd();

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />

      {/* Hero */}
      <div style={{ position: "relative" }}>
        <HeroVisuals />
        <HeroSection />
      </div>

      {/* Metrics */}
      <section aria-label="Key metrics" data-section="metrics" className={styles.section}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Impact</SectionLabel>
          <h2 className={styles.sectionTitle}>By the Numbers</h2>
        </div>
        <MetricsGrid />
      </section>

      {/* Featured Projects */}
      <section aria-label="Featured projects" data-section="featured-projects" className={styles.section}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Featured Work</SectionLabel>
          <h2 className={styles.sectionTitle}>Selected Projects</h2>
        </div>
        <FeaturedProjects projects={projects} />
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section aria-label="Testimonials" data-section="testimonials" className={styles.section}>
          <div className={styles.sectionHeader}>
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className={styles.sectionTitle}>What People Say</h2>
          </div>
          <TestimonialCarousel testimonials={testimonials} />
        </section>
      )}

      {/* Blog Teaser */}
      {posts.length > 0 && (
        <section aria-label="Blog" data-section="blog-teaser" className={styles.section}>
          <div className={styles.sectionHeader}>
            <SectionLabel>From the Blog</SectionLabel>
            <h2 className={styles.sectionTitle}>Latest Thoughts</h2>
          </div>
          <BlogTeaser posts={posts} />
        </section>
      )}

      {/* Contact CTA */}
      <section aria-label="Contact" data-section="contact-cta" className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Let&apos;s Build Together</h2>
        <div className={styles.ctaButtons}>
          <Button href="mailto:dhruvsinghal04@gmail.com" external>Email Me</Button>
          <Button
            href="https://linkedin.com/in/dhruvsinghal04"
            variant="secondary"
            external
          >
            LinkedIn
          </Button>
        </div>
      </section>
    </div>
  );
}
