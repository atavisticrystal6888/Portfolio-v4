"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Framer-motion animates inline transforms from JS, so the global
 * `prefers-reduced-motion` rule in styles/animations.css — which only reaches
 * CSS animations and transitions — never touched the command palette or the
 * mobile drawer. `reducedMotion="user"` makes framer honour the OS setting for
 * every motion component under it.
 *
 * Children are passed through untouched, so server components stay server
 * components; framer-motion is already in the shared bundle via CommandPalette.
 */
export function MotionPrefs({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
