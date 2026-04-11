"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string;
  eventData?: Record<string, unknown>;
  children: ReactNode;
}

export function TrackedLink({
  eventName,
  eventData,
  children,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Fire analytics event
    if (typeof window !== "undefined" && window.va?.track) {
      // For download/external links, use sendBeacon to ensure event fires
      if (props.download !== undefined || props.target === "_blank") {
        const payload = JSON.stringify({ type: "event", event: eventName, data: eventData });
        try {
          navigator.sendBeacon("/_vercel/insights/event", payload);
        } catch {
          window.va.track(eventName, eventData);
        }
      } else {
        window.va.track(eventName, eventData);
      }
    }

    onClick?.(e);
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
