/**
 * The 404 page's one line of personality, kept out of not-found.tsx so that
 * page stays a plain server component that exports its own metadata (as a
 * client component it inherited the home page's title and canonical URL).
 *
 * One fixed line, nothing derived from the URL: every unknown path is answered
 * with the same prerendered /_not-found document, where usePathname() is
 * "/_not-found", while in the browser it is the requested path. A quote picked
 * from the pathname rendered one line on the server and another during
 * hydration, so most unknown paths threw React error #418
 * (tests/e2e/not-found-hydration.spec.ts).
 */
export function NotFoundQuote() {
  return (
    <p
      style={{
        marginTop: "1.25rem",
        fontSize: "1.15rem",
        fontStyle: "italic",
        color: "var(--text)",
      }}
    >
      No user stories matched this path. Try one of the links below.
    </p>
  );
}
