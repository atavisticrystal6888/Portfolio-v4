'use client';

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const magneticEl = useRef<HTMLElement | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;

      // Magnetic pull on CTAs and buttons with .magnetic class
      if (magneticEl.current) {
        const rect = magneticEl.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.2;
        const dy = (e.clientY - cy) * 0.2;
        magneticEl.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const hoveringClass = styles.hovering ?? 'hovering';

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a, button, [role="button"], input, textarea, .skill-tag'
      );
      if (target) {
        hovering.current = true;
        dot.classList.add(hoveringClass);
        ring.classList.add(hoveringClass);
      }
      // Magnetic effect for specific elements
      const magnetic = (e.target as HTMLElement).closest('[data-magnetic]') as HTMLElement | null;
      if (magnetic) {
        magneticEl.current = magnetic;
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a, button, [role="button"], input, textarea, .skill-tag'
      );
      if (target) {
        hovering.current = false;
        dot.classList.remove(hoveringClass);
        ring.classList.remove(hoveringClass);
      }
      // Reset magnetic pull
      const magnetic = (e.target as HTMLElement).closest('[data-magnetic]') as HTMLElement | null;
      if (magnetic) {
        magnetic.style.transform = '';
        magneticEl.current = null;
      }
    };

    const onMouseDown = () => {
      ring.style.width = '28px';
      ring.style.height = '28px';
      ring.style.opacity = '0.6';
    };

    const onMouseUp = () => {
      ring.style.width = hovering.current ? '50px' : '36px';
      ring.style.height = hovering.current ? '50px' : '36px';
      ring.style.opacity = hovering.current ? '0.2' : '0.4';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    dot.style.display = 'block';
    ring.style.display = 'block';

    const animateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      rafId.current = requestAnimationFrame(animateRing);
    };
    rafId.current = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
    </>
  );
}
