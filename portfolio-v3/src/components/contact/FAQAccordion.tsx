"use client";

import { useState } from "react";
import styles from "./FAQAccordion.module.css";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  { question: "What roles are you looking for?", answer: "Product Analyst, Associate Product Manager (APM), or data-driven PM roles where I can blend analytics with product strategy." },
  { question: "Are you open to remote or relocation?", answer: "Yes to both. I'm based in India and open to remote roles or relocation for the right opportunity." },
  { question: "What's the best way to reach you?", answer: "Email at dhruvsinghal04@gmail.com or connect on LinkedIn. I typically respond within 24 hours." },
  { question: "Do you take freelance or consulting work?", answer: "Selectively — for product strategy, analytics setup, or dashboard projects. Reach out with details." },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className={styles.accordion} role="region" aria-label="Frequently asked questions">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={styles.item}>
          <button
            className={styles.question}
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
            aria-controls={`faq-answer-${i}`}
          >
            <span>{item.question}</span>
            <svg
              className={cn(styles.chevron, openIndex === i && styles.chevronOpen)}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div
            id={`faq-answer-${i}`}
            className={cn(styles.answer, openIndex === i && styles.answerOpen)}
            role="region"
          >
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
