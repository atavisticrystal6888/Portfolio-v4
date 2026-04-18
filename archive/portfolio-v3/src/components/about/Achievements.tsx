import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./Achievements.module.css";

const ITEMS = [
  { icon: "🏆", title: "Techstars Startup Weekend", desc: "1st Place — Built and pitched an ed-tech MVP in 54 hours." },
  { icon: "💻", title: "Code Clash Hackathon", desc: "Winner — Full-stack e-commerce solution in 24 hours." },
  { icon: "🇮🇳", title: "Smart India Hackathon", desc: "National Finalist — AI-based student assessment platform." },
  { icon: "🎓", title: "Innovation Council Secretary", desc: "Led 15+ tech events and workshops for 500+ students." },
  { icon: "📋", title: "Event Organizer", desc: "Organized college tech fest with 1000+ participants." },
];

export function Achievements() {
  return (
    <div className={styles.grid}>
      {ITEMS.map((item) => (
        <GlassCard key={item.title} hover className={styles.card}>
          <span className={styles.icon} aria-hidden="true">{item.icon}</span>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.desc}>{item.desc}</p>
        </GlassCard>
      ))}
    </div>
  );
}
