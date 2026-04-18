"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const PM_QUOTES = [
  "Looks like this feature was deprioritized in the last sprint.",
  "This page shipped to production without a spec.",
  "The backlog ate this page. We'll groom it next quarter.",
  "404: This route didn't make it past the PRD review.",
  "No user stories matched this path. Try one of the links below.",
];

const SUGGESTED = [
  { href: "/projects", label: "Projects", desc: "Case studies with real outcomes." },
  { href: "/ai-pm", label: "AI PM", desc: "Playbooks for shipping LLM products." },
  { href: "/blog", label: "Blog", desc: "Essays on product, data & building." },
  { href: "/contact", label: "Contact", desc: "Let's build something together." },
];

export default function NotFound() {
  const [quote] = useState(
    () => PM_QUOTES[Math.floor(Math.random() * PM_QUOTES.length)]
  );

  return (
    <section
      aria-label="Page not found"
      data-section="404"
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
        Error · Not Found
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(5rem, 14vw, 8rem)",
          lineHeight: 1,
          margin: 0,
          color: "var(--text-strong)",
        }}
      >
        404
      </h1>
      <p
        style={{
          marginTop: "1.25rem",
          fontSize: "1.15rem",
          fontStyle: "italic",
          color: "var(--text)",
        }}
      >
        {quote}
      </p>
      <div style={{ marginTop: "2rem" }}>
        <Button href="/">Back to Home</Button>
      </div>

      <div
        style={{
          marginTop: "4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          textAlign: "left",
        }}
        aria-label="Suggested pages"
      >
        {SUGGESTED.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: "block",
              padding: "1.25rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface)",
              textDecoration: "none",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "var(--text-strong)",
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                marginBottom: "0.35rem",
              }}
            >
              {s.label} →
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {s.desc}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

