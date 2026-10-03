import Link from 'next/link';
import styles from './Footer.module.css';
import { BackToTop } from './BackToTop';
import { CONTACT_EMAIL_HREF } from '@/lib/site';
import { getSiteLastUpdated } from '@/lib/last-updated';

/**
 * Eleven links in a single column ran past the fold on mobile and read as a
 * sitemap dump. Two short groups instead: the work, then the person.
 */
const LINK_GROUPS = [
  {
    heading: 'Work',
    links: [
      { href: '/projects', label: 'Projects' },
      { href: '/ai-pm', label: 'AI PM' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    heading: 'More',
    // Lab sits here, not under Work: it is a backlog of unbuilt ideas.
    links: [
      { href: '/about', label: 'About' },
      { href: '/now', label: 'Now' },
      { href: '/uses', label: 'Uses' },
      { href: '/bookshelf', label: 'Bookshelf' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/lab', label: 'Lab' },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: CONTACT_EMAIL_HREF, label: 'Email' },
  { href: 'https://github.com/atavisticrystal6888', label: 'GitHub' },
  { href: 'https://linkedin.com/in/dhruvsinghal6888', label: 'LinkedIn' },
];

export function Footer() {
  const lastUpdated = getSiteLastUpdated();
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Dhruv Singhal
          </Link>
          <p className={styles.tagline}>Product Manager &amp; Builder</p>
          {/* The newest dated change in the published content, not a
              hardcoded date (see src/lib/last-updated.ts). */}
          <p className={styles.updated}>
            Last updated <time dateTime={lastUpdated.iso}>{lastUpdated.label}</time>
            {' · '}
            <Link href="/changelog" className={styles.updatedLink}>
              changelog
            </Link>
          </p>
        </div>

        {LINK_GROUPS.map(({ heading, links }) => (
          <nav
            key={heading}
            className={styles.links}
            aria-label={`Footer navigation: ${heading}`}
          >
            <h2 className={styles.heading}>{heading}</h2>
            <ul className={styles.linkList}>
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={styles.link}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className={styles.social}>
          <h2 className={styles.heading}>Connect</h2>
          <ul className={styles.linkList}>
            <li>
              <Link href="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
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
            {/* Explicit spaces: JSX drops the ones around an expression when
                the surrounding text node wraps onto another line. */}
            &copy;{' '}
            {new Date().getFullYear()}
            {' '}
            Dhruv Singhal. Built with Next.js 16 &amp; TypeScript.
          </p>
          <BackToTop className={styles.backToTop} />
        </div>
      </div>
    </footer>
  );
}
