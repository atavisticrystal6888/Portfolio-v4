"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const PM_QUOTES = [
  "Looks like this feature was deprioritized in the last sprint.",
  "This page shipped to production without a spec.",
  "The backlog ate this page. We'll groom it next quarter.",
];

export default function NotFound() {
  const [quote] = useState(
    () => PM_QUOTES[Math.floor(Math.random() * PM_QUOTES.length)]
  );

  return (
    <section
      aria-label="Page not found"
      data-section="404"
      style={{ textAlign: "center", padding: "4rem 1rem" }}
    >
      <h1 style={{ fontSize: "6rem", lineHeight: 1 }}>404</h1>
      <p style={{ marginTop: "1rem", fontSize: "1.25rem" }}>{quote}</p>
      <div style={{ marginTop: "2rem" }}>
        <Button href="/">Back to Home</Button>
      </div>
    </section>
  );
}
