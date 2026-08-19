import styles from "./ExperienceTimeline.module.css";

interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  description: string;
  current?: boolean;
}

const EXPERIENCE: ExperienceEntry[] = [
  {
    company: "The Sleep Company",
    role: "Product Manager Intern, Growth",
    period: "Jul 2026 - Present",
    description:
      "Driving growth product initiatives: vendor evaluation (BSP/CRM/payments/OMS/WMS), AI-powered operational agents, Shopify Master Catalogue standardization, and PDP user-flow mapping.",
    current: true,
  },
  {
    company: "Wipro",
    role: "AI Product Intern, Wipro TOPS",
    period: "Feb - Jul 2026",
    description:
      "Scoped Auriga ReX (AI enterprise workflow platform) plus crew mobile and records workflows across 12+ aviation scenarios, translating SME input into build-ready specs.",
  },
  {
    company: "Read Riches",
    role: "Founder's Office",
    period: "2024 - 2025",
    description:
      "Ran content-led growth experiments, managed a 4-person research and content team, and helped drive a 4x retention improvement through sharper operating cadence.",
  },
  {
    company: "Omniful.ai",
    role: "Business Analyst Intern",
    period: "2024",
    description:
      "Defined prospect scoring with firmographic and behavioral signals, scaled qualified prospects from roughly 10 per day to 200+ per day, and supported 10 client acquisitions.",
  },
];

export function ExperienceTimeline() {
  return (
    <ol className={styles.ledger}>
      {EXPERIENCE.map((entry) => (
        <li key={entry.company} className={styles.row}>
          <div className={styles.rail}>
            <span className={styles.period}>{entry.period}</span>
            {entry.current && <span className={styles.badge}>Current</span>}
          </div>
          <div className={styles.body}>
            <h3 className={styles.company}>{entry.company}</h3>
            <p className={styles.role}>{entry.role}</p>
            <p className={styles.desc}>{entry.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
