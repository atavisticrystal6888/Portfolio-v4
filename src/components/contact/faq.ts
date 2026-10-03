import { CONTACT_EMAIL } from "@/lib/site";

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Single source for the visible FAQ (FAQAccordion) and the FAQPage JSON-LD
 * (src/app/contact/page.tsx), so the schema can never drift from the page.
 * A plain module, not the "use client" accordion file: a server component
 * importing a value from a client module gets a client reference, not data.
 */
export const FAQ_ITEMS: FAQItem[] = [
  { question: "What roles are you looking for?", answer: "Product Manager, Associate Product Manager (APM), or e-commerce and AI product roles where I can blend domain context, analytics, and execution." },
  { question: "Are you open to remote or relocation?", answer: "Yes to both. I'm based in India and open to remote roles or relocation for the right opportunity." },
  { question: "What's the best way to reach you?", answer: `Email at ${CONTACT_EMAIL} or connect on LinkedIn. I usually reply within a day or two.` },
  { question: "Do you take freelance or consulting work?", answer: "Selectively, but I am primarily focused on full-time Product, APM, and AI product roles right now." },
];
