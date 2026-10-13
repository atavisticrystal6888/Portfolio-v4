import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { NotFoundQuote } from "@/components/ui/NotFoundQuote";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Surface, SurfaceText, SurfaceTitle } from "@/components/ui/Surface";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import section from "@/styles/section.module.css";
import styles from "./status-page.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That route doesn't exist on this site. The page may have moved or the link is mistyped. Try my projects, blog, or contact page instead.",
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
    description: "That route doesn't exist on this site. The page may have moved or the link is mistyped. Try my projects, blog, or contact page instead.",
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
      className={cn(section.section, styles.page)}
    >
      <div className={cn(section.inner, styles.column)}>
        {/* The h1 names the problem; "404" is the large supporting figure. */}
        <SectionLabel as="h1" className={styles.eyebrow}>
          Page not found
        </SectionLabel>
        <p aria-hidden="true" className={styles.figure}>
          404
        </p>
        <NotFoundQuote className={styles.quote} />
        <div className={styles.actions}>
          <Button href="/">Back to home</Button>
        </div>

        {/* A nav, not a bare div: aria-label is prohibited on a role-less
            div (axe aria-prohibited-attr), and these are navigation links. */}
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
