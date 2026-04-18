'use client';

interface BackToTopProps {
  className?: string;
}

export function BackToTop({ className }: BackToTopProps) {
  return (
    <button
      className={className}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      type="button"
    >
      &uarr; Back to top
    </button>
  );
}
