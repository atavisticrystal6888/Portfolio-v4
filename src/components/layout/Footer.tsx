import Link from 'next/link';
import styles from './Footer.module.css';
import { BackToTop } from './BackToTop';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/ai-pm', label: 'AI PM' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/now', label: 'Now' },
  { href: '/lab', label: 'Lab' },
  { href: '/uses', label: 'Uses' },
  { href: '/bookshelf', label: 'Bookshelf' },
  { href: '/changelog', label: 'Changelog' },
];

const SOCIAL_LINKS = [
  { href: 'https://github.com/atavisticrystal6888', label: 'GitHub' },
  { href: 'https://linkedin.com/in/dhruvsinghal6888', label: 'LinkedIn' },
  { href: 'mailto:dhruvsinghal04@gmail.com', label: 'Email' },
];

export function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>Dhruv Singhal</span>
          <p className={styles.tagline}>Product Analyst &amp; Builder</p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          <h3 className={styles.heading}>Quick Links</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.social}>
          <h3 className={styles.heading}>Connect</h3>
          <ul className={styles.linkList}>
            {SOCIAL_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className={styles.link}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} Dhruv Singhal. Built with Next.js 16 &amp; TypeScript.
          </p>
          <BackToTop className={styles.backToTop} />
        </div>
      </div>
    </footer>
  );
}
