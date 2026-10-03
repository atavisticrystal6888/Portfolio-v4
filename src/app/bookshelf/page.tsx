import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import styles from "@/styles/content-page.module.css";
import local from "./bookshelf.module.css";

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
    note: "The source text for how empowered product teams actually work. Re-reading with the Aarchid project as the case study in my head.",
    status: "reading",
  },
  {
    title: "Thinking in Systems",
    author: "Donella Meadows",
    note: "Feedback loops, leverage points, and why most 'metrics that matter' are the wrong metric. Keeps me honest when defining retention metrics.",
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
    note: "'Strategy is the application of strength against weakness.' I still use the diagnosis → guiding policy → coherent actions frame in my PRDs.",
  },
  {
    title: "Measure What Matters",
    author: "John Doerr",
    note: "OKRs done right. The 'how' of turning strategy into a ship-able quarter.",
  },
  {
    title: "High Output Management",
    author: "Andrew Grove",
    note: "The operations manual for anyone who ships things through other people.",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    note: "Not a PM book — but the single best source for reasoning about the systems my products actually run on.",
  },
  {
    title: "The Mom Test",
    author: "Rob Fitzpatrick",
    note: "How to do customer research without flattering yourself. Short, sharp, and I come back to it often.",
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
          <h3>{b.title}</h3>
          {b.status === "reading" && (
            <p className={local.statusRow}>
              <span className={styles.badge}>Reading</span>
            </p>
          )}
          <p>
            <strong className={styles.cardAuthor}>{b.author}</strong>
            <br />
            {b.note}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function BookshelfPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Bookshelf", href: "/bookshelf" },
        ]}
        title="Bookshelf"
        subtitle="The books I credit for shaping how I think about product, systems, and building. Not a reading list — a working bibliography."
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Currently Reading</SectionLabel>
          <h2 className={styles.sectionTitle}>On my desk right now</h2>
          <Shelf books={CURRENT} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Foundation</SectionLabel>
          <h2 className={styles.sectionTitle}>Books that shaped me</h2>
          <Shelf books={SHAPED_ME} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Queue</SectionLabel>
          <h2 className={styles.sectionTitle}>Next up</h2>
          <Shelf books={NEXT_UP} />

          <p className={styles.note}>
            Think I&apos;m missing one?{" "}
            <a href="mailto:dhruvsinghal6888@gmail.com">Tell me</a> — reading
            recommendations are welcome currency.
          </p>
        </div>
      </section>

      <WhereNext />
    </div>
  );
}
