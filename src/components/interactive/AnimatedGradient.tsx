import styles from './AnimatedGradient.module.css';
import { cn } from '@/lib/utils';

/**
 * Decorative background wash. It is a server component: since the gradient is
 * static there is no motion preference left to read on the client, and it no
 * longer hydrates. (The name is kept so imports stay stable.)
 */
export function AnimatedGradient({ className }: { className?: string }) {
  return <div className={cn(styles.gradient, className)} aria-hidden="true" />;
}
