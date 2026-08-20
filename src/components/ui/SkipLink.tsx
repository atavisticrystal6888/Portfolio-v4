"use client";

/**
 * Chrome and Firefox move focus to a fragment target that has tabindex="-1";
 * WebKit does not — it scrolls and leaves focus where it was, so on Safari the
 * next Tab went straight back into the navbar and the link did nothing useful.
 * Focusing the target here makes the three engines agree.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={() => {
        document.getElementById("main-content")?.focus();
      }}
    >
      Skip to main content
    </a>
  );
}
