'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/ai-pm', label: 'AI PM' },
  { href: '/blog', label: 'Blog' },
  // Lab is demoted to the footer "More" group, same as the desktop bar.
  { href: '/contact', label: 'Contact' },
  { href: '/now', label: 'Now' },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Close on Escape, and keep Tab inside the drawer while it is open: the page
  // behind it is still in the tab order otherwise.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      // Move focus ourselves on every Tab rather than only at the edges:
      // Safari and WebKit skip links on plain Tab by default, so the browser's
      // own next stop from inside the drawer can be outside it.
      const items = Array.from(focusable);
      const index = items.indexOf(document.activeElement as HTMLElement);
      const step = e.shiftKey ? -1 : 1;
      const next =
        index === -1
          ? e.shiftKey
            ? items[items.length - 1]
            : items[0]
          : items[(index + step + items.length) % items.length];
      e.preventDefault();
      next?.focus();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Move focus into the drawer on open and hand it back to the trigger on
  // close, so a keyboard user is not left behind the overlay.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement | null;
      const id = requestAnimationFrame(() => {
        drawerRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    const restore = restoreRef.current;
    restoreRef.current = null;
    if (restore && document.contains(restore)) restore.focus();
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Entrance animations are CSS keyframes (MobileNav.module.css): overlay
  // fade, drawer slide-in, staggered links via --i. There is no exit
  // animation: closing unmounts the dialog at once, so it never lingers in the
  // accessibility tree or the tab order. framer-motion was removed from here to
  // keep it out of the shared first-load bundle (perf audit P3).
  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <nav className={styles.nav}>
        {NAV_LINKS.map(({ href, label }, i) => (
          <div
            key={href}
            className={styles.item}
            style={{ "--i": i } as React.CSSProperties}
          >
            <Link
              href={href}
              className={cn(styles.link, isActive(href) && styles.active)}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={onClose}
            >
              {label}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}
