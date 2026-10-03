import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WhereNext } from "@/components/ui/WhereNext";
import { LabMatrix } from "@/components/lab/LabMatrix";
import { SignatureScene } from "@/components/interactive/SignatureScene";
import { getAllLabIdeas } from "@/lib/content";
import styles from "./lab.module.css";

export const metadata = generatePageMetadata({
  title: "Lab",
  description:
    "A working matrix of product ideas at the PM and engineering boundary, mapped by category, difficulty and the PM skill each one exercises. Most will not ship.",
  path: "/lab",
});

export default function LabPage() {
  const ideas = getAllLabIdeas();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Decorative; hidden under 900px, where it sat behind the lede. */}
          <div className={styles.scene}>
            <SignatureScene variant="ambient" />
          </div>
          {/* Same top line as every PageHeader page: the breadcrumb trail. */}
          <div className={styles.crumbs}>
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Lab", href: "/lab" },
              ]}
            />
          </div>
          <h1 className={styles.title}>Lab</h1>
          <p className={styles.lede}>
            {/* Explicit space: JSX trims the one that would otherwise sit
                between the count and the next line of copy. */}
            A working matrix of {ideas.length}{" "}
            product ideas I&apos;ve scoped — each one a hypothetical build that
            maps a real PM skill to a real technical challenge. Most will stay
            ideas. A few will become projects. All of them are me thinking in
            public about what&apos;s worth making.
          </p>
          {/* Lab is out of the primary nav; say plainly what this page is
              and where the built work lives. */}
          <p className={styles.callout} role="note">
            These are unbuilt ideas. Built and tested work lives in{" "}
            <Link href="/projects">Projects</Link>.
          </p>
        </div>
      </header>

      <section className={styles.section} aria-label="Idea matrix">
        <div className={styles.inner}>
          <LabMatrix ideas={ideas} />
        </div>
      </section>

      <section className={styles.section} aria-label="Source note">
        <div className={styles.inner}>
          <p className={styles.note}>
            Source data:{" "}
            <a
              href="https://github.com/atavisticrystal6888/Portfolio-v4/blob/main/content/lab/ideas.json"
              target="_blank"
              rel="noopener noreferrer"
            >
              ideas.json
            </a>
            . Want to build one of these together?{" "}
            <Link href="/contact">Let&apos;s talk</Link>.
          </p>
        </div>
      </section>

      <WhereNext />
    </div>
  );
}
