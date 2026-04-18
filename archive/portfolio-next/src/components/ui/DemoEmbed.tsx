"use client";

import { useState } from "react";
import styles from "./DemoEmbed.module.css";

const ALLOWED_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "loom.com",
  "www.loom.com",
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // YouTube watch → embed
    if (
      (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
    }

    // youtu.be short links
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    }

    // Vimeo
    if (parsed.hostname === "vimeo.com") {
      const id = parsed.pathname.slice(1);
      if (id) return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
    }

    // Loom share → embed
    if (parsed.pathname.startsWith("/share/")) {
      const id = parsed.pathname.replace("/share/", "");
      return `https://www.loom.com/embed/${encodeURIComponent(id)}`;
    }

    return url;
  } catch {
    return url;
  }
}

interface DemoEmbedProps {
  url: string;
  title?: string;
}

export function DemoEmbed({ url, title = "Project demo" }: DemoEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  if (!isAllowedUrl(url)) return null;

  const embedUrl = toEmbedUrl(url);

  return (
    <div className={styles.wrapper}>
      {!loaded && <div className={styles.placeholder} aria-hidden="true" />}
      <iframe
        className={`${styles.iframe} ${loaded ? styles.visible : ""}`}
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
