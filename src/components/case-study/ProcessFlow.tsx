import styles from "./ProcessFlow.module.css";

export interface ProcessStep {
  title: string;
  description: string;
}

interface ProcessFlowProps {
  steps: ProcessStep[];
  title?: string;
}

export function ProcessFlow({ steps, title = "Process" }: ProcessFlowProps) {
  if (steps.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-label={title}>
      <h3 className={styles.heading}>{title}</h3>
      <ol className={styles.list}>
        {steps.map((step, i) => (
          <li key={i} className={styles.step}>
            <div className={styles.number} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className={styles.body}>
              <h4 className={styles.title}>{step.title}</h4>
              <p className={styles.desc}>{step.description}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={styles.connector} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
