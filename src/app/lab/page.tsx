import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import { LabMatrix } from "@/components/lab/LabMatrix";
import { SignatureScene } from "@/components/interactive/SignatureScene";
import { getAllLabIdeas } from "@/lib/content";
import styles from "./lab.module.css";
import section from "@/styles/section.module.css";

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
      {/* Same header as every index page; the ambient scene is its
          decoration (hidden under 900px, where it sat behind the lede). */}
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Lab", href: "/lab" },
        ]}
        title="Lab"
        decoration={<SignatureScene variant="ambient" />}
        subtitle={
          <>
            {/* Explicit space: JSX trims the one that would otherwise sit
                between the count and the next line of copy. */}
            A working matrix of {ideas.length}{" "}
            product ideas I&apos;ve scoped, each one a hypothetical build that
            maps a real PM skill to a real technical challenge. Most will stay
            ideas. A few will become projects. All of them are me thinking in
            public about what&apos;s worth making.
          </>
        }
      >
        {/* Lab is out of the primary nav; say plainly what this page is
            and where the built work lives. */}
        <p className={styles.callout} role="note">
          These are unbuilt ideas. Built and tested work lives in{" "}
          <Link href="/projects">Projects</Link>.
        </p>
      </PageHeader>

      <section className={section.section} aria-label="Idea matrix">
        <div className={section.inner}>
          <LabMatrix ideas={ideas} />
        </div>
      </section>

      <section className={section.section} aria-label="Source note">
        <div className={section.inner}>
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
