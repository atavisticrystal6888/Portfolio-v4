"use client";

import { useEffect, useRef, useState } from "react";

interface MotionVideoProps {
  src: string;
  poster?: string;
  /** Accessible name; videos here are silent product loops. */
  label: string;
  className?: string;
}

/**
 * Muted, looping product clip. Autoplays only when the visitor has not asked
 * for reduced motion; otherwise it sits on its poster with native controls.
 */
export function MotionVideo({ src, poster, label, className }: MotionVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (matches: boolean) => {
      setReduced(matches);
      if (matches) ref.current?.pause();
    };
    apply(mq.matches);
    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={!reduced}
      controls={reduced}
      preload="metadata"
      aria-label={label}
    />
  );
}
