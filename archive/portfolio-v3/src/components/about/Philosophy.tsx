import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./Philosophy.module.css";

const CARDS = [
  {
    icon: "🎯",
    title: "Outcome > Output",
    desc: "Impact matters more than activity. Measure what moves the needle, not what fills the calendar.",
  },
  {
    icon: "📊",
    title: "Data Informs, Intuition Decides",
    desc: "Let numbers guide, not dictate. The best decisions blend quantitative rigor with qualitative insight.",
  },
  {
    icon: "🚀",
    title: "Ship, Measure, Iterate",
    desc: "Progress beats perfection. Get to market fast, learn from real users, and course-correct with data.",
  },
];

export function Philosophy() {
  return (
    <div className={styles.grid}>
      {CARDS.map((c) => (
        <GlassCard key={c.title} hover className={styles.card}>
          <span className={styles.icon} aria-hidden="true">{c.icon}</span>
          <h3 className={styles.title}>{c.title}</h3>
          <p className={styles.desc}>{c.desc}</p>
        </GlassCard>
      ))}
    </div>
  );
}
