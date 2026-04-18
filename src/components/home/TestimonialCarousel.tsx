"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Testimonial } from "@/types/testimonial";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCounter } from "@/components/ui/MetricCounter";
import { cn } from "@/lib/utils";
import styles from "./TestimonialCarousel.module.css";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 8000);
    return () => clearInterval(id);
  }, [paused, next]);

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <GlassCard className={styles.card}>
        <div className={styles.avatar}>
          {t.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <blockquote className={styles.quote}>&ldquo;{t.quote}&rdquo;</blockquote>
        <div className={styles.metric}>
          <MetricCounter value={t.outcomeMetric.value} label={t.outcomeMetric.label} />
        </div>
        <div className={styles.author}>
          <strong>{t.name}</strong>
          <span>{t.title}, {t.company}</span>
          <span className={styles.relationship}>{t.relationship}</span>
        </div>
        <Link href={`/projects/${t.projectSlug}`} className={styles.link}>
          View Case Study →
        </Link>
      </GlassCard>

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
