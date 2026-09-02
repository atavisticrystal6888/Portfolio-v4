import Image from "next/image";
import dhruvImage from "@/assets/Dhruv_Image.jpg";
import { generatePageMetadata, generateWebSiteJsonLd } from "@/lib/metadata";
import { getAllProjects, getAllBlogPosts, getAllTestimonials } from "@/lib/content";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { HeroSection } from "@/components/home/HeroSection";
import { SelectedWork } from "@/components/home/SelectedWork";
import { MetricsGrid } from "@/components/home/MetricsGrid";
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

/* The two posts that show PM judgment rather than tell it. Order matters:
   the eval-harness piece is the strongest AI-PM signal on the site. */
const THINKING_SLUGS = [
  "shipping-llm-products-eval-harness",
  "why-pms-should-code",
];

export default function Home() {
  const allProjects = getAllProjects();
  const posts = getAllBlogPosts();
  const testimonials = getAllTestimonials();
  const webSiteJsonLd = generateWebSiteJsonLd();

  const thinkingPosts = THINKING_SLUGS.map((slug) =>
    posts.find((p) => p.slug === slug)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className={styles.page}>
      {/* Person is emitted once site-wide from the root layout. */}
      <JsonLd id="home-website-jsonld" data={webSiteJsonLd} />

      {/* Hero — title block + contents index; no scene behind it. */}
      <HeroSection />

      {/* Selected work — the work leads; biography lives on /about. */}
      <section
        id="work"
        aria-label="Selected work"
        data-section="selected-work"
        className={styles.section}
      >
        <div className={styles.inner}>
          <header className={`${styles.sectionHeader} ${styles.sectionHeaderTight}`}>
            <SectionLabel index="01">Selected work</SectionLabel>
            <h2 className={styles.sectionTitle}>Five products, built end to end</h2>
          </header>
          <SelectedWork projects={allProjects} />
        </div>
      </section>

      {/* Metrics — the one orchestrated reveal on the page, inside MetricsGrid */}
      <section
        id="outcomes"
        aria-label="Key metrics"
        data-section="metrics"
        className={styles.section}
      >
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="02">Impact</SectionLabel>
            <h2 className={styles.sectionTitle}>Measured outcomes</h2>
          </header>
          <MetricsGrid />
        </div>
      </section>

      {/* Writing that shows the method */}
      {thinkingPosts.length > 0 && (
        <section
          id="thinking"
          aria-label="Writing"
          data-section="blog-teaser"
          className={styles.section}
        >
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <SectionLabel index="03">Method</SectionLabel>
              <h2 className={styles.sectionTitle}>How I think</h2>
            </header>
            <BlogTeaser posts={thinkingPosts} />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section
          id="references"
          aria-label="Testimonials"
          data-section="testimonials"
          className={styles.section}
        >
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <SectionLabel index="04">Testimonials</SectionLabel>
              <h2 className={styles.sectionTitle}>References</h2>
            </header>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* Suggestions — owns its section chrome so it can render nothing */}
      <Suggestions projects={allProjects} posts={posts} />

      {/* Contact CTA. The portrait lives here rather than in the hero: a face
          is the strongest signal that a person made this, and it does the most
          work at the point where someone decides whether to write. */}
      <section
        id="contact"
        aria-label="Contact"
        data-section="contact-cta"
        className={styles.ctaSection}
      >
        <div className={`${styles.inner} ${styles.ctaInner}`}>
          <Image
            src={dhruvImage}
            alt="Dhruv Singhal"
            className={styles.ctaPortrait}
            sizes="(max-width: 767px) 160px, 220px"
            placeholder="blur"
          />
          <div className={styles.ctaCopy}>
            <h2 className={styles.ctaTitle}>Still reading?</h2>
            <p className={styles.ctaLede}>
              Then we should probably talk. Email is the fastest way to reach
              me; LinkedIn works too.
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
        </div>
      </section>
    </div>
  );
}
