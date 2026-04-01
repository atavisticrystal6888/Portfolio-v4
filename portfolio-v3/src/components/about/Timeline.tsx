import styles from "./Timeline.module.css";

interface TimelineItem {
  company: string;
  role: string;
  period: string;
  description: string;
  current?: boolean;
}

const EXPERIENCE: TimelineItem[] = [
  {
    company: "Wipro",
    role: "Product Intern — Aviation OS",
    period: "2025 – Present",
    description: "Leading product analytics for the Aviation OS vertical. Building dashboards, defining KPIs, and driving data-informed feature prioritization.",
    current: true,
  },
  {
    company: "Odena",
    role: "Analytics Consultant",
    period: "2025 – Present",
    description: "Advising on analytics strategy. Built churn prediction models and customer segmentation frameworks.",
    current: true,
  },
  {
    company: "Read Riches",
    role: "Growth & Content PM",
    period: "2024 – 2025",
    description: "Grew content reach 4× through a data-driven content pipeline. Defined and tracked content KPIs across channels.",
  },
  {
    company: "Omniful.ai",
    role: "Business Analyst Intern",
    period: "2024",
    description: "Conducted market research and competitor analysis for the logistics SaaS platform. Created PRDs for 3 features.",
  },
];

export function Timeline() {
  return (
    <div className={styles.timeline}>
      {EXPERIENCE.map((item) => (
        <article key={item.company} className={styles.item}>
          <div className={styles.dot} aria-hidden="true">
            {item.current && <span className={styles.pulse} />}
          </div>
          <div className={styles.content}>
            <div className={styles.header}>
              <h3 className={styles.company}>{item.company}</h3>
              <span className={styles.period}>{item.period}</span>
            </div>
            <p className={styles.role}>{item.role}</p>
            <p className={styles.desc}>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
