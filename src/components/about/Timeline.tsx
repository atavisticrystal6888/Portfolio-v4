import styles from "./Timeline.module.css";

interface TimelineItem {
  company: string;
  role: string;
  type: "Full-time" | "Internship" | "Consulting" | "Side Project";
  period: string;
  description: string;
  current?: boolean;
}

const EXPERIENCE: TimelineItem[] = [
  {
    company: "Wipro",
    role: "Product Trainee",
    type: "Full-time",
    period: "2025 - Present",
    description: "Shipped 3 operational dashboards for aviation ground crews. Defined KPIs across 4 product surfaces and drove data-informed feature prioritization for airline ops.",
    current: true,
  },
  {
    company: "Read Riches",
    role: "Founder's Office",
    type: "Consulting",
    period: "2024 – 2025",
    description: "Owned growth strategy end-to-end from the founder's office. Grew content reach 4× across 3 channels and improved marketing ROI by 28% via attribution modelling.",
  },
  {
    company: "Omniful.ai",
    role: "Business Analyst Intern",
    type: "Internship",
    period: "2024",
    description: "Conducted competitive analysis across 8 logistics SaaS players. Created PRDs for 3 features adopted into the product roadmap.",
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
            <p className={styles.role}>
              {item.role}
              <span className={styles.type}>{item.type}</span>
            </p>
            <p className={styles.desc}>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
