'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Breadcrumbs.module.css';
import { cn } from '@/lib/utils';

const SEGMENT_LABELS: Record<string, string> = {
  about: 'About',
  projects: 'Projects',
  blog: 'Blog',
  contact: 'Contact',
  now: 'Now',
  'case-studies': 'Case Studies',
  aarkid: 'Aarkid',
  'churn-analysis': 'Churn Analysis',
  'marketing-effectiveness': 'Marketing Effectiveness',
  'portfolio-site': 'Portfolio Site',
  'why-pms-should-code': 'Why PMs Should Code',
  'data-driven-product-decisions': 'Data-Driven Product Decisions',
  'structured-thinking-framework': 'Structured Thinking Framework',
};

function segmentToLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, i) => ({
    label: segmentToLabel(segment),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <nav className={cn(styles.breadcrumbs, className)} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>Home</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
        </li>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link href={crumb.href} className={styles.link}>
                    {crumb.label}
                  </Link>
                  <span className={styles.separator} aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
