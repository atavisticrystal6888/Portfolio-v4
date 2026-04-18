'use client';

import styles from './AnimatedGradient.module.css';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export function AnimatedGradient({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={cn(
        styles.gradient,
        prefersReduced && styles.paused,
        className
      )}
      aria-hidden="true"
    />
  );
}
