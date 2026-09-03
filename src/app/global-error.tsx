"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort boundary: it replaces the root layout, so it must ship its own
 * <html>/<body> and cannot use CSS modules or the design tokens (globals.css is
 * loaded by the layout that just failed). Inline styles only, deliberately.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fcfbf8",
          color: "#24262b",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#5c5f66",
              margin: "0 0 1rem",
            }}
          >
            Error · Unexpected
          </p>
          <h1
            style={{
              fontSize: "1.75rem",
              lineHeight: 1.2,
              margin: 0,
              color: "#14161a",
            }}
          >
            Something went wrong on this page
          </h1>
          <p style={{ marginTop: "1rem", color: "#5c5f66", lineHeight: 1.7 }}>
            This part of the site failed to load. Trying again usually fixes it —
            if it doesn&apos;t, the rest of the site still works.
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#5c5f66" }}>
              Reference: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: "44px",
                padding: "10px 24px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                background: "#2137c4",
                color: "#fcfbf8",
              }}
            >
              Try again
            </button>
            {/* A hard navigation on purpose: the root layout and the router
                tree are gone at this point, so next/link's client transition
                cannot be trusted here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 24px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "1px solid #2137c4",
                color: "#2137c4",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
