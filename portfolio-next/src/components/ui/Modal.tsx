import styles from "./Modal.module.css";
import { cn } from "@/lib/utils";

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function Modal({ children, open, onClose, className }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn(styles.container, className)}>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
