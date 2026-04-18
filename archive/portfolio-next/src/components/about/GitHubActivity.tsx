"use client";

import type { GitHubData } from "@/lib/github";
import { Badge } from "@/components/ui/Badge";
import styles from "./GitHubActivity.module.css";

interface GitHubActivityProps {
  data: GitHubData;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function intensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

export function GitHubActivity({ data }: GitHubActivityProps) {
  if (data.repos.length === 0) {
    return (
      <p className={styles.empty}>
        GitHub activity unavailable — check back later.
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Contribution heatmap (last 30 days) */}
      <div className={styles.heatmap}>
        <p className={styles.heatmapLabel}>Last 30 days</p>
        <div className={styles.grid}>
          {data.recentCommitDays.map((count, i) => (
            <div
              key={i}
              className={styles.cell}
              data-level={intensityLevel(count)}
              title={`${count} event${count !== 1 ? "s" : ""}, ${i} day${i !== 1 ? "s" : ""} ago`}
            />
          ))}
        </div>
      </div>

      {/* Pinned / recent repos */}
      <ul className={styles.repos}>
        {data.repos.slice(0, 4).map((repo) => (
          <li key={repo.name} className={styles.repo}>
            <a href={repo.url} target="_blank" rel="noopener noreferrer" className={styles.repoLink}>
              {repo.name}
            </a>
            <p className={styles.repoDesc}>{repo.description || "No description"}</p>
            <div className={styles.repoMeta}>
              <Badge variant="outline">{repo.language}</Badge>
              {repo.stars > 0 && <span className={styles.stars}>★ {repo.stars}</span>}
              <span className={styles.updated}>Updated {daysSince(repo.updatedAt)}d ago</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
