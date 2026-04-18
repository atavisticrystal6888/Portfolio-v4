'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './OnekoCat.module.css';

interface Position {
  x: number;
  y: number;
}

interface SpriteSet {
  [key: string]: [number, number][];
}

const SPRITE_SETS: SpriteSet = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  scratchWallN: [[0, 0], [0, -1]],
  scratchWallS: [[-7, -1], [-6, -2]],
  scratchWallE: [[-2, -2], [-2, -3]],
  scratchWallW: [[-4, 0], [-4, -1]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

const NEKO_SPEED = 10;
const FRAME_INTERVAL = 100;

export function OnekoCat() {
  const nekoRef = useRef<HTMLDivElement>(null);
  const nekoPos = useRef<Position>({ x: 32, y: 32 });
  const mousePos = useRef<Position>({ x: 0, y: 0 });
  const frameCount = useRef(0);
  const idleTime = useRef(0);
  const idleAnimation = useRef<string | null>(null);
  const idleAnimationFrame = useRef(0);
  const lastFrameTimestamp = useRef<number>(0);
  const rafId = useRef<number>(0);

  const setSprite = useCallback((name: string, frame: number) => {
    if (!nekoRef.current || !SPRITE_SETS[name]) return;
    const sprites = SPRITE_SETS[name];
    const sprite = sprites[frame % sprites.length];
    if (!sprite) return;
    nekoRef.current.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }, []);

  const resetIdleAnimation = useCallback(() => {
    idleAnimation.current = null;
    idleAnimationFrame.current = 0;
  }, []);

  useEffect(() => {
    // Skip on touch devices or reduced motion
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 639px)').matches) return;

    const neko = nekoRef.current;
    if (!neko) return;

    neko.style.display = 'block';

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleIdle = () => {
      idleTime.current += 1;

      if (idleTime.current > 10 && Math.floor(Math.random() * 200) === 0 && !idleAnimation.current) {
        const available = ['sleeping', 'scratchSelf'];
        if (nekoPos.current.x < 32) available.push('scratchWallW');
        if (nekoPos.current.y < 32) available.push('scratchWallN');
        if (nekoPos.current.x > window.innerWidth - 32) available.push('scratchWallE');
        if (nekoPos.current.y > window.innerHeight - 32) available.push('scratchWallS');
        idleAnimation.current = available[Math.floor(Math.random() * available.length)] ?? null;
      }

      switch (idleAnimation.current) {
        case 'sleeping':
          if (idleAnimationFrame.current < 8) {
            setSprite('tired', 0);
            break;
          }
          setSprite('sleeping', Math.floor(idleAnimationFrame.current / 4));
          if (idleAnimationFrame.current > 192) resetIdleAnimation();
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
        case 'scratchSelf':
          setSprite(idleAnimation.current, idleAnimationFrame.current);
          if (idleAnimationFrame.current > 9) resetIdleAnimation();
          break;
        default:
          setSprite('idle', 0);
          return;
      }
      idleAnimationFrame.current += 1;
    };

    const handleFrame = () => {
      frameCount.current += 1;
      const diffX = nekoPos.current.x - mousePos.current.x;
      const diffY = nekoPos.current.y - mousePos.current.y;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

      if (distance < NEKO_SPEED || distance < 48) {
        handleIdle();
        return;
      }

      idleAnimation.current = null;
      idleAnimationFrame.current = 0;

      if (idleTime.current > 1) {
        setSprite('alert', 0);
        idleTime.current = Math.max(idleTime.current - 1, 0);
        return;
      }

      let direction = '';
      direction += diffY / distance > 0.5 ? 'N' : '';
      direction += diffY / distance < -0.5 ? 'S' : '';
      direction += diffX / distance > 0.5 ? 'W' : '';
      direction += diffX / distance < -0.5 ? 'E' : '';

      if (direction) setSprite(direction, frameCount.current);

      const newX = nekoPos.current.x - (diffX / distance) * NEKO_SPEED;
      const newY = nekoPos.current.y - (diffY / distance) * NEKO_SPEED;

      nekoPos.current = {
        x: Math.min(Math.max(16, newX), window.innerWidth - 16),
        y: Math.min(Math.max(16, newY), window.innerHeight - 16),
      };

      if (neko) {
        neko.style.left = `${nekoPos.current.x - 16}px`;
        neko.style.top = `${nekoPos.current.y - 16}px`;
      }
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimestamp.current > FRAME_INTERVAL) {
        lastFrameTimestamp.current = timestamp;
        handleFrame();
      }
      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [setSprite, resetIdleAnimation]);

  return (
    <div
      ref={nekoRef}
      className={styles.neko}
      aria-hidden="true"
    />
  );
}
