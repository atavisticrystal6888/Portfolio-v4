"use client";

import { useEffect, useRef } from "react";

interface FramedShotVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Muted, looping, inline demo clip. Autoplay is a CSS-unreachable attribute,
 * so `prefers-reduced-motion` is honoured here: the clip stays on its poster
 * and only plays if the visitor asks.
 */
export function FramedShotVideo({ src, poster, className }: FramedShotVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.pause();
      el.removeAttribute("autoplay");
    }
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      preload="metadata"
    />
  );
}
