'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { useIntersection } from '@/hooks/useIntersection';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
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

  const style: CSSProperties = {
    opacity: isIntersecting ? 1 : 0,
    transform: isIntersecting ? 'translate(0, 0)' : `translate(${dx}px, ${dy}px)`,
    transition: `opacity ${duration}s ease ${totalDelay}s, transform ${duration}s ease ${totalDelay}s`,
    willChange: 'opacity, transform',
  };

  return (
    <div className={className} ref={ref as React.Ref<HTMLDivElement>} style={style}>
      {children}
    </div>
  );
}
