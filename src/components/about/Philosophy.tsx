import styles from "./Philosophy.module.css";

const CARDS = [
  {
    title: "Outcome > Output",
    desc: "I cut dashboards and features that do not change a decision, then align stakeholders around the few workflows that actually deserve priority.",
  },
  {
    title: "Data Informs, Intuition Decides",
    desc: "An offline eval score says how often the model is right on cases I chose. It cannot say whether people will trust the answer enough to act on it. Both questions matter.",
  },
  {
    title: "Ship, Measure, Iterate",
    desc: "Ship the smallest version that can be wrong in a useful way, then let what breaks rewrite the spec. Perfection is the enemy of learning.",
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
