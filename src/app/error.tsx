"use client";

import { startTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Surface, SurfaceText, SurfaceTitle } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";
import section from "@/styles/section.module.css";
import styles from "./status-page.module.css";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const SUGGESTED = [
  { href: "/projects", label: "Projects", desc: "Case studies with their evidence and limits." },
  { href: "/contact", label: "Contact", desc: "Talk product, roles, and opportunities." },
];

/**
 * Route-level error boundary. Next renders this in place of the segment when a
 * render throws, so it keeps the root layout (nav, footer, theme) around it.
 */
export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // The digest is the only handle on the server-side stack, so log the whole
    // error object rather than just its message.
    console.error(error);
    // Move focus to the explanation so keyboard and screen-reader users are
    // not left on whatever triggered the failure.
    headingRef.current?.focus();
  }, [error]);

  // reset() alone only re-renders on the client, so a failed server render
  // would throw the same cached error again. Refetch the segment first.
  const retry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <section
      aria-label="Something went wrong"
      data-section="error"
      className={cn(section.section, styles.page)}
    >
      <div className={cn(section.inner, styles.column)}>
        <SectionLabel className={styles.eyebrow}>Error &middot; Unexpected</SectionLabel>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          Something went wrong on this page
        </h1>
        <p className={styles.text}>
          This part of the site failed to load. Trying again usually fixes it. If
          it doesn&apos;t, the rest of the site still works.
        </p>

        {error.digest && <p className={styles.digest}>Reference: {error.digest}</p>}

        <div className={styles.actions}>
          <Button onClick={retry}>Try again</Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>

        <nav className={styles.suggested} aria-label="Suggested pages">
          {SUGGESTED.map((s) => (
            <Surface key={s.href} href={s.href}>
              <SurfaceTitle>{s.label} &rarr;</SurfaceTitle>
              <SurfaceText>{s.desc}</SurfaceText>
            </Surface>
          ))}
        </nav>
      </div>
    </section>
  );
}
