"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const SUGGESTED = [
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

/**
 * Route-level error boundary. Next renders this in place of the segment when a
 * render throws, so it keeps the root layout (nav, footer, theme) around it.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack, so log the whole
    // error object rather than just its message.
    console.error(error);
  }, [error]);

  return (
    <section
      aria-label="Something went wrong"
      data-section="error"
      style={{
        textAlign: "center",
        padding: "6rem 1rem 4rem",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "1rem",
        }}
      >
        Error · Unexpected
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
          lineHeight: 1.15,
          margin: 0,
          color: "var(--text-strong)",
        }}
      >
        Something went wrong on this page
      </h1>
      <p
        style={{
          marginTop: "1rem",
          color: "var(--text-muted)",
          fontSize: "1rem",
          lineHeight: 1.7,
        }}
      >
        This part of the site failed to load. Trying again usually fixes it — if
        it doesn&apos;t, the rest of the site still works.
      </p>

      {error.digest && (
        <p
          style={{
            marginTop: "0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Reference: {error.digest}
        </p>
      )}

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">
          Go home
        </Button>
      </div>

      <p
        style={{
          marginTop: "2.5rem",
          fontSize: "0.9rem",
          color: "var(--text-muted)",
        }}
      >
        Or head to{" "}
        {SUGGESTED.map((s, i) => (
          <span key={s.href}>
            {i > 0 && " or "}
            <Link href={s.href} style={{ color: "var(--accent)" }}>
              {s.label}
            </Link>
          </span>
        ))}
        .
      </p>
    </section>
  );
}
