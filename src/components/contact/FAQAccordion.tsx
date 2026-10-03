"use client";

import { useState } from "react";
import styles from "./FAQAccordion.module.css";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS } from "./faq";

export { FAQ_ITEMS } from "./faq";

/**
 * Disclosure list, not a set of landmarks: the page's FAQ section is the one
 * named region (labelled by its visible heading), each button owns its answer
 * through aria-controls, and a collapsed answer is `hidden` so it leaves the
 * accessibility tree instead of sitting there as an empty region.
 */
export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className={styles.accordion}>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={styles.item}>
          <button
            type="button"
            id={`faq-question-${i}`}
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
            hidden={openIndex !== i}
          >
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
