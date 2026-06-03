'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/interactive/ThemeToggle';
import { MusicToggle } from '@/components/interactive/MusicToggle';
import { MobileNav } from './MobileNav';
import dhruvImage from '../../../Dhruv_Image.jpg';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/ai-pm', label: 'AI PM' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={cn(styles.nav, scrolled && styles.scrolled)}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.inner}>
          <Link href="/" className={styles.logo} aria-label="Dhruv Singhal - Home">
            <span className={styles.mark} aria-hidden="true">
              <Image
                src={dhruvImage}
                alt=""
                className={styles.markImage}
                sizes="40px"
              />
            </span>
            <span className={styles.logoText}>Dhruv Singhal</span>
          </Link>

          <ul className={styles.links}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(styles.link, isActive(href) && styles.active)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <MusicToggle />
            <ThemeToggle />

            <button
              className={styles.cmdTrigger}
              aria-label="Open command palette"
              onClick={() => {
                document.dispatchEvent(new CustomEvent('open-command-palette'));
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <kbd>Ctrl+K</kbd>
            </button>

            <a
              href="/resume/dhruv-singhal-resume.pdf"
              className={styles.resumeLink}
              download
              aria-label="Download resume (PDF)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Resume</span>
            </a>

            <Link href="/contact" className={styles.cta} data-magnetic>
              Let&apos;s Connect
            </Link>

            <button
              className={cn(styles.hamburger, mobileOpen && styles.open)}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
