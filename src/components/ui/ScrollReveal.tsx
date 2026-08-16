'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { useIntersection } from '@/hooks/useIntersection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './ScrollReveal.module.css';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  stagger?: number;
  index?: number;
}

const directionMap: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: -30, y: 0 },
  right: { x: 30, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance,
  className,
  stagger = 0,
  index = 0,
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  // Content is visible by default (SSR, no-JS, print, full-page capture).
  // The entrance animation applies only to elements the observer reported
  // off-screen, so nothing readable is ever hidden and no synchronous
  // layout reads are needed.
  const { ref, isIntersecting, wasOffscreen } = useIntersection<HTMLDivElement>({
    threshold: 0.05,
    rootMargin: '50px 0px -10px 0px',
    triggerOnce: true,
  });

  if (reducedMotion) {
    return (
      <div className={className} ref={ref as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    );
  }

  const offset = directionMap[direction];
  const dx = distance ? (offset.x > 0 ? distance : offset.x < 0 ? -distance : 0) : offset.x;
  const dy = distance ? (offset.y > 0 ? distance : offset.y < 0 ? -distance : 0) : offset.y;
  const totalDelay = delay + stagger * index;
  const hidden = wasOffscreen && !isIntersecting;

  const style: CSSProperties | undefined = wasOffscreen
    ? {
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translate(${dx}px, ${dy}px)` : 'translate(0, 0)',
        transition: `opacity ${duration}s ease ${totalDelay}s, transform ${duration}s ease ${totalDelay}s`,
        // Hint only while hidden; release the GPU layer once revealed.
        willChange: hidden ? 'opacity, transform' : 'auto',
      }
    : undefined;

  return (
    <div
      className={className ? `${styles.reveal} ${className}` : styles.reveal}
      ref={ref as React.Ref<HTMLDivElement>}
      style={style}
    >
      {children}
    </div>
  );
}
