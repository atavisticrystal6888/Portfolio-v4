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
    period: "2026 - Present",
    description:
      "Scoped crew mobile and records workflows across 12+ aviation scenarios, translated SME input into build-ready specs, and aligned success criteria with engineering and QA.",
    current: true,
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
