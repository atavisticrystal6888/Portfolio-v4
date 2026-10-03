import styles from "./Skills.module.css";

/* Plain lists, no scores. The old radar plotted self-rated percentages that
   implied a measurement; the evidence for each skill is in the case studies. */
const CATEGORIES = [
  { name: "Product", skills: ["PRDs & Roadmaps", "User Research", "A/B Testing", "Growth Strategy", "Metrics Design"] },
  { name: "Data", skills: ["Python", "SQL", "Pandas", "Scikit-learn", "Tableau"] },
  { name: "Technical", skills: ["Next.js", "React", "TypeScript", "Git", "REST APIs"] },
  { name: "Soft Skills", skills: ["Stakeholder Mgmt", "Cross-functional", "Presentation", "Problem Solving"] },
];

export function Skills() {
  return (
    <div className={styles.categories} data-testid="skills">
      {CATEGORIES.map((cat) => (
        <div key={cat.name} className={styles.category}>
          <h3 className={styles.catTitle}>{cat.name}</h3>
          <ul className={styles.tags}>
            {cat.skills.map((s) => (
              <li key={s} className={styles.tag}>{s}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
