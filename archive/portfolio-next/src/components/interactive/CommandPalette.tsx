'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CommandPalette.module.css';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useBehavior } from '@/hooks/useBehavior';

interface PaletteItem {
  id: string;
  label: string;
  group: string;
  action: 'navigate' | 'theme' | 'external' | 'clipboard' | 'download';
  target?: string;
  shortcut?: string;
}

const ITEMS: PaletteItem[] = [
  // Pages
  { id: 'home', label: 'Go to Home', group: 'Pages', action: 'navigate', target: '/' },
  { id: 'about', label: 'Go to About', group: 'Pages', action: 'navigate', target: '/about' },
  { id: 'projects', label: 'Go to Projects', group: 'Pages', action: 'navigate', target: '/projects' },
  { id: 'blog', label: 'Go to Blog', group: 'Pages', action: 'navigate', target: '/blog' },
  { id: 'contact', label: 'Go to Contact', group: 'Pages', action: 'navigate', target: '/contact' },
  { id: 'now', label: 'Go to Now', group: 'Pages', action: 'navigate', target: '/now' },
  // Case Studies
  { id: 'cs-aarkid', label: 'Aarkid — Flora Monitoring', group: 'Case Studies', action: 'navigate', target: '/projects/aarkid' },
  { id: 'cs-churn', label: 'Customer Churn Analysis', group: 'Case Studies', action: 'navigate', target: '/projects/churn-analysis' },
  { id: 'cs-marketing', label: 'Marketing Campaign Effectiveness', group: 'Case Studies', action: 'navigate', target: '/projects/marketing-effectiveness' },
  { id: 'cs-portfolio', label: 'This Portfolio — Meta Case Study', group: 'Case Studies', action: 'navigate', target: '/projects/portfolio-site' },
  // Blog Articles
  { id: 'blog-pms', label: 'Why PMs Should Learn to Code', group: 'Blog Articles', action: 'navigate', target: '/blog/why-pms-should-code' },
  { id: 'blog-data', label: 'Data-Driven Product Decisions', group: 'Blog Articles', action: 'navigate', target: '/blog/data-driven-product-decisions' },
  { id: 'blog-thinking', label: 'Structured Thinking Framework', group: 'Blog Articles', action: 'navigate', target: '/blog/structured-thinking-framework' },
  // Actions
  { id: 'toggle-theme', label: 'Toggle Theme', group: 'Actions', action: 'theme', shortcut: 'T' },
  { id: 'download-resume', label: 'Download Resume', group: 'Actions', action: 'download', target: '/resume/Dhruv_Singhal_Resume.pdf' },
  { id: 'copy-url', label: 'Copy Page URL', group: 'Actions', action: 'clipboard', shortcut: 'C' },
];

const GROUP_ORDER = ['Pages', 'Case Studies', 'Blog Articles', 'Actions'];

function getRecencyBoost(target: string | undefined, recentSlugs: string[]): number {
  if (!target) return 0;
  const idx = recentSlugs.indexOf(target);
  if (idx === -1) return 0;
  // Last 5 visited pages get a boost, decaying by position
  return Math.max(0, 0.3 - idx * 0.06);
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toggleMode } = useTheme();
  const { behavior } = useBehavior();

  // Recent pages for recency boost
  const recentSlugs = useMemo(() => {
    return behavior.pagesVisited
      .slice(-5)
      .reverse()
      .map((v) => v.slug);
  }, [behavior.pagesVisited]);

  const filtered = useMemo(() => {
    let items = ITEMS;
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(item => item.label.toLowerCase().includes(q));
    }
    // Sort with recency boost
    return [...items].sort((a, b) => {
      const boostA = getRecencyBoost(a.target, recentSlugs);
      const boostB = getRecencyBoost(b.target, recentSlugs);
      if (boostA !== boostB) return boostB - boostA;
      // Preserve group order for non-boosted items
      return GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
    });
  }, [query, recentSlugs]);

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const group of GROUP_ORDER) {
      const items = filtered.filter(item => item.group === group);
      if (items.length > 0) map.set(group, items);
    }
    return map;
  }, [filtered]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const execute = useCallback((item: PaletteItem) => {
    close();
    if (item.action === 'navigate' && item.target) {
      router.push(item.target);
    } else if (item.action === 'theme') {
      toggleMode();
    } else if (item.action === 'external' && item.target) {
      window.open(item.target, '_blank', 'noopener,noreferrer');
    } else if (item.action === 'clipboard') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setToastMessage('URL copied to clipboard');
      });
    } else if (item.action === 'download' && item.target) {
      const a = document.createElement('a');
      a.href = item.target;
      a.download = '';
      a.click();
    }
  }, [close, router, toggleMode]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
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

  // Toast message auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            className={styles.palette}
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
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
                <div key={groupName} className={styles.group}>
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
                        {item.shortcut && (
                          <kbd className={styles.shortcutHint}>{item.shortcut}</kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
