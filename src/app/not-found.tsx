import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { NotFoundQuote } from "@/components/ui/NotFoundQuote";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That route doesn't exist on this site. The page may have moved or the link is mistyped — try my projects, blog, or contact page instead.",
  // The root layout sets a site-wide canonical; without this override a 404
  // told crawlers it was canonically the home page.
  alternates: { canonical: undefined },
  // null clears the robots/googlebot tags inherited from the root layout
  // ("index, follow"). Next itself always adds <meta name="robots"
  // content="noindex"> to a 404 response (NonIndex in app-render), so that is
  // the page's one and only robots directive. Any object here would render a
  // second robots meta next to Next's, which is what build 2 showed.
  robots: null,
  openGraph: {
    title: `Page not found | ${SITE_NAME}`,
    description: "That route doesn't exist on this site. The page may have moved or the link is mistyped — try my projects, blog, or contact page instead.",
  },
};

const SUGGESTED = [
  { href: "/projects", label: "Projects", desc: "Case studies with their evidence and limits." },
  { href: "/ai-pm", label: "AI PM", desc: "Playbooks for shipping LLM products." },
  { href: "/blog", label: "Blog", desc: "Essays on product, data & building." },
  { href: "/contact", label: "Contact", desc: "Talk product, roles, and opportunities." },
];

export default function NotFound() {
  return (
    <section
      aria-label="Page not found"
      data-section="404"
      style={{
        textAlign: "center",
        // Same 24px side gutter as every other page.
        padding: "6rem var(--space-6) 4rem",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      {/* The h1 names the problem; "404" is the large supporting figure. */}
      <h1
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: "0 0 1rem",
        }}
      >
        Page not found
      </h1>
      <p
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(5rem, 14vw, 8rem)",
          fontWeight: 700,
          lineHeight: 1,
          margin: 0,
          color: "var(--text-strong)",
        }}
      >
        404
      </p>
      <NotFoundQuote />
      <div style={{ marginTop: "2rem" }}>
        <Button href="/">Back to Home</Button>
      </div>

      {/* A nav, not a bare div: aria-label is prohibited on a role-less
          div (axe aria-prohibited-attr), and these are navigation links. */}
      <nav
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
      </nav>
    </section>
  );
}

