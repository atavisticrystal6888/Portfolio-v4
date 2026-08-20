import styles from "./Achievements.module.css";

const ITEMS = [
  { title: "Techstars Startup Weekend", desc: "1st Place — Built and pitched an ed-tech MVP in 54 hours." },
  { title: "Code Clash Hackathon", desc: "Winner — Full-stack e-commerce solution in 24 hours." },
  { title: "Smart India Hackathon", desc: "National Finalist — AI-based student assessment platform." },
  { title: "Innovation Council Secretary", desc: "Led 15+ tech events and workshops for 500+ students." },
  { title: "Event Organizer", desc: "Organized college tech fest with 1000+ participants." },
];

export function Achievements() {
  return (
    <ul className={styles.list}>
      {ITEMS.map((item) => (
        <li key={item.title} className={styles.row}>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.desc}>{item.desc}</p>
        </li>
      ))}
    </ul>
  );
}
