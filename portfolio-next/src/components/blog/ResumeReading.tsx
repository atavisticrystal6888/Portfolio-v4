"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { getProgressForSlug, clearProgressForSlug } from "@/components/blog/ReadingProgress";

interface ResumeReadingProps {
  slug: string;
}

export function ResumeReading({ slug }: ResumeReadingProps) {
  const { showToast } = useToast();
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    if (prompted) return;
    const saved = getProgressForSlug(slug);
    if (saved && saved > 10) {
      setPrompted(true);
      const percent = Math.round(saved);
      showToast(
        `You were ${percent}% through this article. Scroll down to resume.`,
        "info"
      );

      // Scroll to saved position after a brief delay
      setTimeout(() => {
        const el = document.documentElement;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const targetScroll = (saved / 100) * scrollHeight;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }, 1500);
    }
  }, [slug, showToast, prompted]);

  // Clear saved progress when article is fully read
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0 && scrollTop / scrollHeight > 0.95) {
        clearProgressForSlug(slug);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}
