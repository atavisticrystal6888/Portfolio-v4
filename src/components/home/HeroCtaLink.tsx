"use client";

import { Button } from "@/components/ui/Button";
import { HERO_CTA_EVENT } from "@/lib/experiments/hero";

/**
 * The hero CTA when the visitor is enrolled in the experiment: identical to
 * the plain Button, plus a fire-and-forget beacon to our own origin. The
 * navigation is an in-page anchor, so nothing waits on the request.
 */
export function HeroCtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  const onClick = () => {
    try {
      void fetch("/api/experiments/track", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: HERO_CTA_EVENT }),
      }).catch(() => undefined);
    } catch {
      // A beacon must never interfere with the click.
    }
  };
  return (
    <Button href={href} onClick={onClick}>
      {children}
    </Button>
  );
}
