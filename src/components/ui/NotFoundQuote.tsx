"use client";

import { useState } from "react";

const PM_QUOTES = [
  "Looks like this feature was deprioritized in the last sprint.",
  "This page shipped to production without a spec.",
  "The backlog ate this page. We'll groom it next quarter.",
  "404: This route didn't make it past the PRD review.",
  "No user stories matched this path. Try one of the links below.",
];

/**
 * The one interactive scrap of the 404 page. It lives here so not-found.tsx can
 * stay a server component and export its own metadata — as a client component
 * it inherited the home page's title and canonical URL.
 */
export function NotFoundQuote() {
  // Randomize on initial render; suppressHydrationWarning handles server/client mismatch
  const [quote] = useState(() => PM_QUOTES[Math.floor(Math.random() * PM_QUOTES.length)]!);

  return (
    <p
      suppressHydrationWarning
      style={{
        marginTop: "1.25rem",
        fontSize: "1.15rem",
        fontStyle: "italic",
        color: "var(--text)",
      }}
    >
      {quote}
    </p>
  );
}
