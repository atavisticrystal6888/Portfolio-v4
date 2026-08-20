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
    company: "The Sleep Company",
    role: "Product Manager Intern, Growth",
    type: "Internship",
    period: "Jul 2026 – Present",
    description: "Driving growth product initiatives for a D2C sleep brand: vendor evaluation across BSPs, CRMs, payment aggregators, OMS, and WMS; AI-powered operational agents and a centralized knowledge repository; Shopify Master Catalogue standardization and PDP user-flow mapping.",
    current: true,
  },
  {
    company: "Wipro",
    role: "AI Product Intern, Wipro TOPS",
    type: "Internship",
    period: "Feb – Jul 2026",
    description: "Scoped Auriga ReX, an AI-powered enterprise workflow platform, plus Crew Mobile and Non-Crew Records workflows across 12+ aviation scenarios — surfacing edge cases early and moving specs into active sprint development.",
  },
  {
    company: "Read Riches",
    role: "Founder's Office",
    type: "Consulting",
    period: "2024 – 2025",
    description: "Ran content-led growth experiments, managed a 4-person research and content team, and contributed to a 4x retention improvement through better publishing cadence and feedback loops.",
  },
  {
    company: "Omniful.ai",
    role: "Business Analyst Intern",
    type: "Internship",
    period: "2024",
    description: "Defined prospect scoring using firmographic and behavioral signals, scaled qualified prospects from about 10 per day to 200+ per day, and supported 10 client acquisitions.",
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
