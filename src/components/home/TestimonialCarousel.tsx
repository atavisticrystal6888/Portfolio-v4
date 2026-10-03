"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Testimonial } from "@/types/testimonial";
import { cn } from "@/lib/utils";
import styles from "./TestimonialCarousel.module.css";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    };
    const wrapper = document.querySelector('[data-carousel="testimonials"]');
    if (wrapper) {
      wrapper.addEventListener('keydown', handleKeyDown as EventListener);
      return () => wrapper.removeEventListener('keydown', handleKeyDown as EventListener);
    }
  }, [prev, next]);

  const t = testimonials[active];
  if (!t) return null;

  return (
    <div
      className={styles.wrapper}
      data-carousel="testimonials"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <figure className={styles.card}>
        <blockquote className={styles.quote}>&ldquo;{t.quote}&rdquo;</blockquote>
        <figcaption className={styles.footer}>
          <div className={styles.attribution}>
            <div className={styles.avatar}>
              {t.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.avatar}
                  alt=""
                  aria-hidden="true"
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                t.name.split(" ").map((n) => n[0]).join("")
              )}
            </div>
            <div className={styles.author}>
              <strong>{t.name}</strong>
              <span>{t.title}, {t.company}</span>
              <span className={styles.relationship}>{t.relationship}</span>
            </div>
          </div>
        </figcaption>
        {t.projectSlug && (
          <Link href={`/projects/${t.projectSlug}`} className={styles.link}>
            View case study &rarr;
          </Link>
        )}
      </figure>

      <div className={styles.controls}>
        <button className={styles.arrow} onClick={prev} aria-label="Previous testimonial">←</button>
        <div className={styles.dots}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={cn(styles.dot, i === active && styles.dotActive)}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button className={styles.arrow} onClick={next} aria-label="Next testimonial">→</button>
      </div>
    </div>
  );
}
