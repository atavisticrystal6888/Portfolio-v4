import { generatePageMetadata, generatePersonJsonLd, generateWebSiteJsonLd } from "@/lib/metadata";
import { getAllProjects, getAllBlogPosts, getAllTestimonials } from "@/lib/content";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { HeroVisuals } from "@/components/home/HeroVisuals";
import { HeroSection } from "@/components/home/HeroSection";
import { MetricsGrid } from "@/components/home/MetricsGrid";
import { ExperienceTimeline } from "@/components/home/ExperienceTimeline";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { Suggestions } from "@/components/home/Suggestions";
import { JsonLd } from "@/components/ui/JsonLd";
import { CONTACT_EMAIL_HREF } from "@/lib/site";
import styles from "./home.module.css";

export const metadata = generatePageMetadata({
  title: "Dhruv Singhal — Product Manager & Builder",
  description:
    "Portfolio of Dhruv Singhal — Product Manager & Builder. D2C e-commerce growth, enterprise AI workflows, AI diagnostics, and operational analytics.",
});

export default function Home() {
  const allProjects = getAllProjects();
  const posts = getAllBlogPosts();
  const testimonials = getAllTestimonials();
  const personJsonLd = generatePersonJsonLd();
  const webSiteJsonLd = generateWebSiteJsonLd();

  return (
    <div className={styles.page}>
      <JsonLd id="home-person-jsonld" data={personJsonLd} />
      <JsonLd id="home-website-jsonld" data={webSiteJsonLd} />

      {/* Hero */}
      <div style={{ position: "relative" }}>
        <HeroVisuals />
        <HeroSection />
      </div>

      {/* Metrics — the one orchestrated reveal on the page, inside MetricsGrid */}
      <section aria-label="Key metrics" data-section="metrics" className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="01">Impact</SectionLabel>
            <h2 className={styles.sectionTitle}>Measured outcomes</h2>
          </header>
          <MetricsGrid />
        </div>
      </section>

      {/* Experience */}
      <section aria-label="Experience" data-section="experience" className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="02">Career</SectionLabel>
            <h2 className={styles.sectionTitle}>Where I&apos;ve built</h2>
          </header>
          <ExperienceTimeline />
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section aria-label="Testimonials" data-section="testimonials" className={styles.section}>
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <SectionLabel index="03">Testimonials</SectionLabel>
              <h2 className={styles.sectionTitle}>References</h2>
            </header>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* Blog Teaser */}
      {posts.length > 0 && (
        <section aria-label="Blog" data-section="blog-teaser" className={styles.section}>
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <SectionLabel index="04">From the blog</SectionLabel>
              <h2 className={styles.sectionTitle}>Recent writing</h2>
            </header>
            <BlogTeaser posts={posts} />
          </div>
        </section>
      )}

      {/* Suggestions — owns its section chrome so it can render nothing */}
      <Suggestions projects={allProjects} posts={posts} />

      {/* Contact CTA */}
      <section aria-label="Contact" data-section="contact-cta" className={styles.ctaSection}>
        <div className={styles.inner}>
          <h2 className={styles.ctaTitle}>Still reading?</h2>
          <p className={styles.ctaLede}>
            Then we should probably talk. Email is the fastest way to reach me;
            LinkedIn works too.
          </p>
          <div className={styles.ctaButtons}>
            <Button href={CONTACT_EMAIL_HREF} external>Email me</Button>
            <Button
              href="https://linkedin.com/in/dhruvsinghal6888"
              variant="secondary"
              external
            >
              LinkedIn
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
