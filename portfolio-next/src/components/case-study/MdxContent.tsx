import styles from "./MdxContent.module.css";

interface MdxContentProps {
  html: string;
}

export function MdxContent({ html }: MdxContentProps) {
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
