import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { FAQAccordion } from "@/components/contact/FAQAccordion";
import { AvailabilityBadge } from "@/components/contact/AvailabilityBadge";
import { DirectLinks } from "@/components/contact/DirectLinks";
import styles from "./contact.module.css";

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Dhruv Singhal — open to Product Analyst, APM, and data-driven PM roles.",
  path: "/contact",
});

export default function ContactPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What roles are you looking for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Product Analyst, Associate Product Manager (APM), or data-driven PM roles where I can blend analytics with product strategy.",
        },
      },
      {
        "@type": "Question",
        name: "Are you open to remote or relocation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes to both. Based in India and open to remote roles or relocation for the right opportunity.",
        },
      },
      {
        "@type": "Question",
        name: "What's the best way to reach you?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Email at dhruvsinghal04@gmail.com or connect on LinkedIn. Typically respond within 24 hours.",
        },
      },
      {
        "@type": "Question",
        name: "Do you take freelance or consulting work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Selectively — for product strategy, analytics setup, or dashboard projects.",
        },
      },
    ],
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHeader
        title="Let's Build Something Together"
        subtitle="Looking for a Product Analyst, APM, or data-driven PM to join your team? Let's talk."
        badge="Open to Opportunities"
      />

      <div className={styles.section}>
        <AvailabilityBadge />
      </div>

      {/* Contact Form */}
      <section className={styles.section} aria-label="Contact form">
        <ContactForm />
      </section>

      {/* Direct Links */}
      <section className={styles.section} aria-label="Direct contact links">
        <div className={styles.sectionHeader}>
          <SectionLabel>Or reach out directly</SectionLabel>
        </div>
        <DirectLinks />
      </section>

      {/* FAQ */}
      <section className={styles.section} aria-label="Frequently asked questions">
        <div className={styles.sectionHeader}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className={styles.sectionTitle}>Common Questions</h2>
        </div>
        <FAQAccordion />
      </section>

      {/* Location */}
      <p className={styles.location}>Based in India · IST (UTC+5:30)</p>
    </div>
  );
}
