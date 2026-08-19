import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { JsonLd } from "@/components/ui/JsonLd";
import { LabMatrix } from "@/components/lab/LabMatrix";
import { getAllLabIdeas } from "@/lib/content";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Lab",
  description:
    "A working matrix of product ideas at the intersection of PM and engineering - mapped by category, difficulty, and the PM skill they exercise. Some I'll ship. Most won't. Thinking in public.",
  path: "/lab",
});

export default function LabPage() {
  const ideas = getAllLabIdeas();

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Lab", url: "/lab" },
  ]);

  return (
    <div className={styles.page}>
      <JsonLd id="lab-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      <p className={styles.kicker}>Ideas in motion</p>
      <h1 className={styles.title}>Lab</h1>
      <p className={styles.lede}>
        A working matrix of {ideas.length} product ideas I&apos;ve scoped - each
        one a hypothetical build that maps a real PM skill to a real technical
        challenge. Most will stay ideas. A few will become projects. All of
        them are me thinking in public about what&apos;s worth making.
      </p>

      <LabMatrix ideas={ideas} />

      <p className={styles.note}>
        Source data:{" "}
        <a
          href="https://github.com/atavisticrystal6888/Portfolio-v4/blob/main/content/lab/ideas.json"
          target="_blank"
          rel="noopener noreferrer"
        >
          ideas.json
        </a>
        . Want to build one of these together? Let&apos;s talk.
      </p>
    </div>
  );
}
