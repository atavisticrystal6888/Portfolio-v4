import styles from "./Achievements.module.css";

const ITEMS = [
  // Worded exactly as the resume has them (claim-gates F8;
  // content/resume/dhruv-singhal-ai-pm.md lists the Code Clash entry).
  { title: "Techstars Startup Weekend (DTU)", desc: "3rd Place — Led problem discovery, market sizing, GTM and the pitch for a job-matching platform." },
  { title: "Smart India Hackathon", desc: "Top 5." },
  { title: "Code Clash (VIT Vellore)", desc: "Top 10." },
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
