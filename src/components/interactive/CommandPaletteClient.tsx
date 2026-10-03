'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CommandPalette.module.css';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILE_NAME, RESUME_HREF } from '@/lib/site';
import type { PaletteName } from '@/types/theme';

type PaletteAction = 'navigate' | 'theme' | 'palette' | 'external' | 'copy' | 'download';

interface PaletteItem {
  id: string;
  label: string;
  group: string;
  action: PaletteAction;
  /** For navigate/external/palette: URL or palette name. For copy: text. For download: file href. */
  target?: string;
  /** Extra terms to match on - never shown, only searched. */
  keywords?: string;
  /** Optional file name when action === 'download'. */
  downloadAs?: string;
}

const PAGE_ITEMS: PaletteItem[] = [
  // Pages
  { id: 'home', label: 'Go to Home', group: 'Pages', action: 'navigate', target: '/' },
  { id: 'about', label: 'Go to About', group: 'Pages', action: 'navigate', target: '/about', keywords: 'bio background experience' },
  { id: 'projects', label: 'Go to Projects', group: 'Pages', action: 'navigate', target: '/projects', keywords: 'case studies work portfolio' },
  { id: 'ai-pm', label: 'Go to AI PM', group: 'Pages', action: 'navigate', target: '/ai-pm', keywords: 'ai product manager playbook llm' },
  { id: 'blog', label: 'Go to Blog', group: 'Pages', action: 'navigate', target: '/blog', keywords: 'articles writing essays' },
  { id: 'contact', label: 'Go to Contact', group: 'Pages', action: 'navigate', target: '/contact' },
  { id: 'now', label: 'Go to Now', group: 'Pages', action: 'navigate', target: '/now', keywords: 'currently working learning' },
  { id: 'lab', label: 'Go to Lab', group: 'Pages', action: 'navigate', target: '/lab', keywords: 'experiments ideas matrix dashboard' },
  { id: 'uses', label: 'Go to Uses', group: 'Pages', action: 'navigate', target: '/uses', keywords: 'stack tools setup' },
  { id: 'bookshelf', label: 'Go to Bookshelf', group: 'Pages', action: 'navigate', target: '/bookshelf', keywords: 'books reading notes' },
  { id: 'changelog', label: 'Go to Changelog', group: 'Pages', action: 'navigate', target: '/changelog', keywords: 'build log updates releases' },

];

// Case studies and articles are passed in from the server wrapper
// (CommandPalette.tsx), built from content/projects.json and content/blog, so
// the palette can never drift from what is published.
const ACTION_ITEMS: PaletteItem[] = [
  // Quick Actions
  { id: 'copy-email', label: 'Copy email address', group: 'Actions', action: 'copy', target: CONTACT_EMAIL, keywords: 'clipboard mail contact' },
  { id: 'download-resume', label: 'Download resume (PDF)', group: 'Actions', action: 'download', target: RESUME_HREF, downloadAs: RESUME_FILE_NAME, keywords: 'cv curriculum vitae' },
  { id: 'open-github', label: 'Open GitHub profile', group: 'Actions', action: 'external', target: GITHUB_URL, keywords: 'repos code atavisticrystal6888' },
  { id: 'open-linkedin', label: 'Open LinkedIn profile', group: 'Actions', action: 'external', target: LINKEDIN_URL },
  { id: 'send-email', label: 'Send email to Dhruv', group: 'Actions', action: 'external', target: `mailto:${CONTACT_EMAIL}` },
  { id: 'toggle-theme', label: 'Toggle Dark/Light Mode', group: 'Actions', action: 'theme', keywords: 'dark light mode theme' },

  // Theme Colors
  { id: 'palette-teal', label: 'Accent: Teal', group: 'Theme Colors', action: 'palette', target: 'teal' },
  { id: 'palette-ocean', label: 'Accent: Ocean', group: 'Theme Colors', action: 'palette', target: 'ocean' },
  { id: 'palette-emerald', label: 'Accent: Emerald', group: 'Theme Colors', action: 'palette', target: 'emerald' },
  { id: 'palette-amber', label: 'Accent: Amber', group: 'Theme Colors', action: 'palette', target: 'amber' },
  { id: 'palette-mono', label: 'Accent: Mono', group: 'Theme Colors', action: 'palette', target: 'mono' },
];

export interface PaletteCaseStudy {
  slug: string;
  name: string;
  keywords: string;
}

export interface PalettePost {
  slug: string;
  title: string;
  keywords: string;
}

interface CommandPaletteClientProps {
  caseStudies: PaletteCaseStudy[];
  posts: PalettePost[];
}

export function CommandPaletteClient({ caseStudies, posts }: CommandPaletteClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Whatever had focus before the palette opened, so Escape can hand it back.
  const restoreRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { toggleMode, setPalette } = useTheme();

  const ITEMS = useMemo<PaletteItem[]>(
    () => [
      ...PAGE_ITEMS,
      ...caseStudies.map((c) => ({
        id: `cs-${c.slug}`,
        label: c.name,
        group: 'Case Studies',
        action: 'navigate' as const,
        target: `/projects/${c.slug}`,
        keywords: c.keywords,
      })),
      ...posts.map((p) => ({
        id: `blog-${p.slug}`,
        label: p.title,
        group: 'Blog Articles',
        action: 'navigate' as const,
        target: `/blog/${p.slug}`,
        keywords: p.keywords,
      })),
      ...ACTION_ITEMS,
    ],
    [caseStudies, posts]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return ITEMS;
    const q = query.toLowerCase();
    return ITEMS.filter(item => {
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.group.toLowerCase().includes(q)) return true;
      if (item.keywords && item.keywords.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [query, ITEMS]);

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const existing = map.get(item.group) ?? [];
      existing.push(item);
      map.set(item.group, existing);
    }
    return map;
  }, [filtered]);

  const open = useCallback(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
    // Without this focus falls to <body> and the next Tab restarts at the top
    // of the page.
    const restore = restoreRef.current;
    restoreRef.current = null;
    if (restore && document.contains(restore)) {
      requestAnimationFrame(() => restore.focus());
    }
  }, []);

  const execute = useCallback((item: PaletteItem) => {
    close();
    if (item.action === 'navigate' && item.target) {
      router.push(item.target);
    } else if (item.action === 'theme') {
      toggleMode();
    } else if (item.action === 'palette' && item.target) {
      setPalette(item.target as PaletteName);
    } else if (item.action === 'external' && item.target) {
      window.open(item.target, '_blank', 'noopener,noreferrer');
    } else if (item.action === 'copy' && item.target) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(item.target).catch(() => {});
      }
    } else if (item.action === 'download' && item.target) {
      const a = document.createElement('a');
      a.href = item.target;
      a.download = item.downloadAs ?? '';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [close, router, toggleMode, setPalette]);

  // Keyboard shortcut to open. Escape lives here too, not only on the
  // palette's own onKeyDown: the input takes focus a frame after open, so an
  // Escape pressed in that gap lands on the trigger button and the dialog
  // never heard it (an intermittent close failure on WebKit).
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, open, close]);

  // Custom event from navbar trigger
  useEffect(() => {
    const handler = () => open();
    document.addEventListener('open-command-palette', handler);
    return () => document.removeEventListener('open-command-palette', handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 >= filtered.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 < 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (activeIndex >= 0 && item) {
        execute(item);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-palette-item]');
    items[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // The entrance is a CSS keyframe (CommandPalette.module.css) and there is no
  // exit animation: on close the dialog leaves the DOM, the accessibility tree
  // and the focus order in the same commit. framer-motion was removed from
  // here to keep it out of the shared first-load bundle (perf audit P3).
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon} aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search pages, actions..."
            autoComplete="off"
            aria-label="Search commands"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        <div className={styles.results} ref={listRef}>
          {filtered.length === 0 && (
            <p className={styles.empty}>No results found</p>
          )}
          {Array.from(groups.entries()).map(([groupName, items]) => (
            <div key={groupName} className={styles.group} data-palette-group={groupName}>
              <div className={styles.groupTitle}>{groupName}</div>
              {items.map((item) => {
                const globalIndex = filtered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    data-palette-item
                    className={cn(
                      styles.item,
                      globalIndex === activeIndex && styles.itemActive
                    )}
                    onClick={() => execute(item)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                    type="button"
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
