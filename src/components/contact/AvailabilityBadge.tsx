import styles from "./AvailabilityBadge.module.css";

export function AvailabilityBadge() {
  return (
    <div className={styles.badge}>
      <span className={styles.dot} />
      <span>Open to Opportunities</span>
    </div>
  );
}
