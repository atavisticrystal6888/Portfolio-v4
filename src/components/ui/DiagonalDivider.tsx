import styles from './DiagonalDivider.module.css';
import { cn } from '@/lib/utils';

interface DiagonalDividerProps {
  side: 'left' | 'right';
  className?: string;
}

export function DiagonalDivider({ side, className }: DiagonalDividerProps) {
  return (
    <div
      className={cn(
        styles.divider,
        side === 'left' ? styles.left : styles.right,
        className
      )}
      aria-hidden="true"
    >
      <div className={styles.pattern} />
    </div>
  );
}
