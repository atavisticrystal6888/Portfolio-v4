"use client";

import { useState, useMemo } from "react";
import { debounce } from "@/lib/utils";
import type { BlogArticle } from "@/types/blog";
import { ListRows } from "@/components/ui/ListRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { BlogCard } from "./BlogCard";
import styles from "./BlogSearch.module.css";

const CATEGORIES = ["All", "Product", "Data", "AI", "Career"];

interface BlogSearchProps {
  posts: BlogArticle[];
}

export function BlogSearch({ posts }: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  // The search box is uncontrolled so the debounce doesn't fight the keystroke;
  // bumping this key remounts it, which is how "Clear search" empties the field.
  const [inputKey, setInputKey] = useState(0);

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, query, activeCategory]);

  const handleSearch = debounce((value: string) => {
    setQuery(value);
  }, 200);

  function clearFilters() {
    setQuery("");
    setActiveCategory("All");
    setInputKey((k) => k + 1);
  }

  const trimmedQuery = query.trim();
  const emptyDescription = [
    trimmedQuery ? `Nothing matches “${trimmedQuery}”` : "Nothing matches this filter",
    activeCategory !== "All" ? `in ${activeCategory}` : null,
  ]
    .filter(Boolean)
    .join(" ")
    .concat(". Clear the search to see every article.");

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.active : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            key={inputKey}
            type="search"
            className={styles.search}
            placeholder="Search articles..."
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search blog articles"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <ListRows>
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </ListRows>
      ) : (
        <div className={styles.empty}>
          <EmptyState
            title="No articles match"
            description={emptyDescription}
            action={{ label: "Clear search", onClick: clearFilters }}
          />
        </div>
      )}
    </div>
  );
}
