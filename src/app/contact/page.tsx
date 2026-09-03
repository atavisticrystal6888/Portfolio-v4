import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { FAQAccordion } from "@/components/contact/FAQAccordion";
import { DirectLinks } from "@/components/contact/DirectLinks";
import { JsonLd } from "@/components/ui/JsonLd";
import { absoluteUrl, CONTACT_EMAIL, CONTACT_PHONE, SITE_NAME, SITE_URL } from "@/lib/site";
import styles from "./contact.module.css";

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Dhruv Singhal — open to Product Manager, APM, and AI product roles.",
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

  // ContactPage carries the reachable channels themselves; the Person node in
  // the root layout stays the canonical identity.
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Dhruv Singhal",
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Recruiting and product enquiries",
        email: CONTACT_EMAIL,
        telephone: CONTACT_PHONE,
        areaServed: "Worldwide",
        availableLanguage: ["English", "Hindi"],
      },
    },
  };

  return (
    <div className={styles.page}>
      <JsonLd id="contact-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      <JsonLd id="contact-page-jsonld" data={contactPageJsonLd} />
      <JsonLd id="contact-faq-jsonld" data={faqJsonLd} />

      {/* The badge says what he is actually looking for rather than the
          generic "Open to Opportunities" chip; the FAQ below says the same
          thing at length. */}
      <PageHeader
        title="Where to find me"
        subtitle="Hiring for a Product, APM, or AI product role is the fastest reason to write. A question about one of these builds, or a correction, works too."
        badge="Looking for full-time PM / APM roles"
      />

      {/* Form + direct channels, one spread */}
      <section className={styles.section} aria-label="Ways to reach me">
        <div className={styles.inner}>
          <div className={styles.reachGrid}>
            <div className={styles.formColumn}>
              <div className={styles.sectionHeader}>
                <SectionLabel index="01">Write to me</SectionLabel>
              </div>
              <ContactForm />
            </div>
            <aside className={styles.aside} aria-label="Direct contact links">
              <div className={styles.asideHeader}>
                <SectionLabel index="02">Or reach out directly</SectionLabel>
              </div>
              <DirectLinks />
              <p className={styles.location}>Based in India · IST (UTC+5:30)</p>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section} aria-label="Frequently asked questions">
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <SectionLabel index="03">FAQ</SectionLabel>
            <h2 className={styles.sectionTitle}>Common Questions</h2>
          </div>
          <div className={styles.faq}>
            <FAQAccordion />
          </div>
        </div>
      </section>
    </div>
  );
}
