import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { FAQAccordion } from "@/components/contact/FAQAccordion";
import { DirectLinks } from "@/components/contact/DirectLinks";
import { JsonLd } from "@/components/ui/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CONTACT_EMAIL } from "@/lib/site";
import styles from "./contact.module.css";

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Dhruv Singhal - open to Product Manager, APM, and AI product roles.",
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
          text: "Product Manager, Associate Product Manager (APM), or e-commerce and AI product roles where I can blend domain context, analytics, and execution.",
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
          text: `Email at ${CONTACT_EMAIL} or connect on LinkedIn. Typically respond within 24 hours.`,
        },
      },
      {
        "@type": "Question",
        name: "Do you take freelance or consulting work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Selectively, but I am primarily focused on full-time Product, APM, and AI product roles right now.",
        },
      },
    ],
  };

  return (
    <div className={styles.page}>
      <JsonLd id="contact-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      <JsonLd id="contact-faq-jsonld" data={faqJsonLd} />

      <PageHeader
        title="Let's Talk Product"
        subtitle="Hiring for Product, APM, or AI product roles? I would love to talk."
        badge="Open to Opportunities"
      />

      {/* Contact Form */}
      <ScrollReveal delay={0.1}>
        <section className={styles.section} aria-label="Contact form">
          <ContactForm />
        </section>
      </ScrollReveal>

      {/* Direct Links */}
      <ScrollReveal delay={0.15}>
        <section className={styles.section} aria-label="Direct contact links">
          <div className={styles.sectionHeader}>
            <SectionLabel>Or reach out directly</SectionLabel>
          </div>
          <DirectLinks />
        </section>
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal delay={0.2}>
        <section className={styles.section} aria-label="Frequently asked questions">
          <div className={styles.sectionHeader}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className={styles.sectionTitle}>Common Questions</h2>
          </div>
          <FAQAccordion />
        </section>
      </ScrollReveal>

      {/* Location */}
      <p className={styles.location}>Based in India · IST (UTC+5:30)</p>
    </div>
  );
}
