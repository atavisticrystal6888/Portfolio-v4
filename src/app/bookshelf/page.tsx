import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Bookshelf",
  description:
    "Books that shaped how I think about product, systems, and building. Currently reading, recently finished, and all-time rereads.",
  path: "/bookshelf",
});

interface Book {
  title: string;
  author: string;
  note: string;
  status?: "reading" | "done";
}

const CURRENT: Book[] = [
  {
    title: "Inspired",
    author: "Marty Cagan",
    note: "The source text for how empowered product teams actually work. Re-reading with the Aarkid project as the case study in my head.",
    status: "reading",
  },
  {
    title: "Thinking in Systems",
    author: "Donella Meadows",
    note: "Feedback loops, leverage points, and why most 'metrics that matter' are the wrong metric. Keeps me honest when modelling churn.",
    status: "reading",
  },
];

const SHAPED_ME: Book[] = [
  {
    title: "The Hard Thing About Hard Things",
    author: "Ben Horowitz",
    note: "A PM's tolerance for ambiguity comes from reading founders who lived inside it. This is the best example of the genre.",
  },
  {
    title: "Good Strategy / Bad Strategy",
    author: "Richard Rumelt",
    note: "'Strategy is the application of strength against weakness.' I still use the diagnosis → guiding policy → coherent actions frame in every PRD.",
  },
  {
    title: "Measure What Matters",
    author: "John Doerr",
    note: "OKRs done right. The 'how' of turning strategy into a ship-able quarter.",
  },
  {
    title: "High Output Management",
    author: "Andrew Grove",
    note: "The operations manual for anyone who ships things through other people. Re-read every 18 months.",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    note: "Not a PM book — but the single best source for reasoning about the systems my products actually run on.",
  },
  {
    title: "The Mom Test",
    author: "Rob Fitzpatrick",
    note: "How to do customer research without flattering yourself. Short, sharp, and I quote it weekly.",
  },
];

const NEXT_UP: Book[] = [
  {
    title: "Working Backwards",
    author: "Colin Bryar & Bill Carr",
    note: "Amazon's PR-FAQ in primary sources.",
  },
  {
    title: "The Scout Mindset",
    author: "Julia Galef",
    note: "Calibration and updating beliefs — core PM meta-skill.",
  },
  {
    title: "AI Engineering",
    author: "Chip Huyen",
    note: "For the AI PM playbooks I'm writing.",
  },
];

function Shelf({ books }: { books: Book[] }) {
  return (
    <div className={styles.cardGrid}>
      {books.map((b) => (
        <div key={b.title} className={styles.card}>
          <h3>
            {b.title}
            {b.status === "reading" && (
              <span className={styles.badge}>Reading</span>
            )}
          </h3>
          <p>
            <strong style={{ color: "var(--text)" }}>{b.author}</strong>
            <br />
            {b.note}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function BookshelfPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Bookshelf", url: "/bookshelf" },
  ]);

  return (
    <div className={styles.page}>
      <JsonLd id="bookshelf-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      <p className={styles.kicker}>Reading</p>
      <h1 className={styles.title}>Bookshelf</h1>
      <p className={styles.lede}>
        The books I credit for shaping how I think about product, systems, and
        building. Not a reading list — a working bibliography.
      </p>

      <ScrollReveal>
        <div className={styles.section}>
          <SectionLabel>Currently Reading</SectionLabel>
          <h2 className={styles.sectionTitle}>On my desk right now</h2>
          <Shelf books={CURRENT} />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className={styles.section}>
          <SectionLabel>Foundation</SectionLabel>
          <h2 className={styles.sectionTitle}>Books that shaped me</h2>
          <Shelf books={SHAPED_ME} />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className={styles.section}>
          <SectionLabel>Queue</SectionLabel>
          <h2 className={styles.sectionTitle}>Next up</h2>
          <Shelf books={NEXT_UP} />
        </div>
      </ScrollReveal>

      <p className={styles.note}>
        Think I&apos;m missing one?{" "}
        <a href="mailto:dhruvsinghal04@gmail.com">Tell me</a> — reading
        recommendations are welcome currency.
      </p>
    </div>
  );
}
