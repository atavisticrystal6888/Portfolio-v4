'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CommandPalette.module.css';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import type { PaletteName } from '@/types/theme';

interface PaletteItem {
  id: string;
  label: string;
  group: string;
  action: 'navigate' | 'theme' | 'palette' | 'external';
  target?: string;
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
  { id: 'toggle-theme', label: 'Toggle Dark/Light Mode', group: 'Actions', action: 'theme' },
  { id: 'palette-teal', label: 'Accent: Teal', group: 'Theme Colors', action: 'palette', target: 'teal' },
  { id: 'palette-ocean', label: 'Accent: Ocean', group: 'Theme Colors', action: 'palette', target: 'ocean' },
  { id: 'palette-emerald', label: 'Accent: Emerald', group: 'Theme Colors', action: 'palette', target: 'emerald' },
  { id: 'palette-amber', label: 'Accent: Amber', group: 'Theme Colors', action: 'palette', target: 'amber' },
  { id: 'palette-mono', label: 'Accent: Mono', group: 'Theme Colors', action: 'palette', target: 'mono' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggleMode, setPalette } = useTheme();

  const filtered = useMemo(() => {
    if (!query.trim()) return ITEMS;
    const q = query.toLowerCase();
    return ITEMS.filter(item => item.label.toLowerCase().includes(q));
  }, [query]);

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
    } else if (item.action === 'palette' && item.target) {
      setPalette(item.target as PaletteName);
    } else if (item.action === 'external' && item.target) {
      window.open(item.target, '_blank', 'noopener,noreferrer');
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
