import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { FAQAccordion } from "@/components/contact/FAQAccordion";
import { FAQ_ITEMS } from "@/components/contact/faq";
import { DirectLinks } from "@/components/contact/DirectLinks";
import { JsonLd } from "@/components/ui/JsonLd";
import { absoluteUrl, CONTACT_EMAIL, CONTACT_PHONE, SITE_NAME, SITE_URL } from "@/lib/site";
import styles from "./contact.module.css";

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Contact Dhruv Singhal about Product Manager, APM and AI PM roles: email, phone, LinkedIn and GitHub, plus answers on remote work and relocation.",
  path: "/contact",
});

export default function ContactPage() {
  // Built from the same FAQ_ITEMS the accordion renders, so the schema and
  // the visible answers cannot drift.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
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
      <JsonLd id="contact-page-jsonld" data={contactPageJsonLd} />
      <JsonLd id="contact-faq-jsonld" data={faqJsonLd} />

      {/* The meta line says what he is actually looking for; the FAQ below
          says the same thing at length. */}
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
        title="Where to find me"
        subtitle="Hiring for a Product, APM, or AI product role is the fastest reason to write. A question about one of these builds, or a correction, works too."
        meta="Looking for full-time PM / APM roles"
      />

      {/* Form + direct channels, one spread */}
      <section className={styles.section} aria-label="Ways to reach me">
        <div className={styles.inner}>
          <div className={styles.reachGrid}>
            <div className={styles.formColumn}>
              {/* h2 so heading navigation reaches the form; it looks like
                  the other section labels. */}
              <h2 className={`${styles.sectionHeader} ${styles.labelHeading}`}>
                <SectionLabel index="01">Write to me</SectionLabel>
              </h2>
              <ContactForm />
            </div>
            {/* A plain group, not an <aside>: these links are the other half
                of the contact spread, not tangential content, and a
                complementary landmark nested in this region failed axe's
                landmark-complementary-is-top-level. */}
            <div className={styles.aside} role="group" aria-label="Direct contact links">
              <h2 className={`${styles.asideHeader} ${styles.labelHeading}`}>
                <SectionLabel index="02">Or reach out directly</SectionLabel>
              </h2>
              <DirectLinks />
              <p className={styles.location}>Based in India · IST (UTC+5:30)</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section} aria-labelledby="contact-faq-heading">
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <SectionLabel index="03">FAQ</SectionLabel>
            <h2 className={styles.sectionTitle} id="contact-faq-heading">Common Questions</h2>
          </div>
          <div className={styles.faq}>
            <FAQAccordion />
          </div>
        </div>
      </section>
    </div>
  );
}
