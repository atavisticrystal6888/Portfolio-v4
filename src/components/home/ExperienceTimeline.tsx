import { GlassCard } from "@/components/ui/GlassCard";
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
    company: "Wipro",
    role: "Product Intern",
    period: "2025 - Present",
    description:
      "Leading product analytics. Building dashboards, defining KPIs, and driving data-informed feature prioritization.",
    current: true,
  },
  {
    company: "Read Riches",
    role: "Growth & Content PM",
    period: "2024 - 2025",
    description:
      "Grew content reach 4x through a data-driven content pipeline. Defined and tracked content KPIs across channels.",
  },
  {
    company: "Omniful.ai",
    role: "Business Analyst Intern",
    period: "2024",
    description:
      "Conducted market research and competitor analysis for the logistics SaaS platform. Created PRDs for 3 features.",
  },
];

export function ExperienceTimeline() {
  return (
    <div className={styles.grid}>
      {EXPERIENCE.map((entry) => (
        <GlassCard key={entry.company} as="article" hover className={styles.card}>
          <div className={styles.header}>
            <h3 className={styles.company}>{entry.company}</h3>
            <span className={styles.period}>{entry.period}</span>
          </div>
          <p className={styles.role}>{entry.role}</p>
          <p className={styles.desc}>{entry.description}</p>
          {entry.current && <span className={styles.badge}>Current</span>}
        </GlassCard>
      ))}
    </div>
  );
}
