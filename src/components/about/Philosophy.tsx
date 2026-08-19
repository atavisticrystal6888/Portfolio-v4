import styles from "./Philosophy.module.css";

const CARDS = [
  {
    title: "Outcome > Output",
    desc: "I cut dashboards and features that do not change a decision, then align stakeholders around the few workflows that actually deserve priority.",
  },
  {
    title: "Data Informs, Intuition Decides",
    desc: "Aarchid's eval harness told us accuracy was 92% - but user interviews revealed trust was the real bottleneck. Both signals matter.",
  },
  {
    title: "Ship, Measure, Iterate",
    desc: "This portfolio went live in 3 weeks, then I iterated through 5 versions. Perfection is the enemy of learning.",
  },
];

export function Philosophy() {
  return (
    <ul className={styles.list}>
      {CARDS.map((c) => (
        <li key={c.title} className={styles.row}>
          <h3 className={styles.title}>{c.title}</h3>
          <p className={styles.desc}>{c.desc}</p>
        </li>
      ))}
    </ul>
  );
}
