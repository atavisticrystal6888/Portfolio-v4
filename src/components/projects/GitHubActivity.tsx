import Link from "next/link";
import type { GitHubProfile } from "@/types/github";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import styles from "./GitHubActivity.module.css";

interface GitHubActivityProps {
  profile: GitHubProfile;
}

export function GitHubActivity({ profile }: GitHubActivityProps) {
  if (profile.pinnedRepos.length === 0 && profile.totalContributions === 0) {
    return null;
  }

  return (
    <section aria-label="GitHub Activity" className={styles.wrapper}>
      <div className={styles.header}>
        <SectionLabel>Open Source</SectionLabel>
        <h2 className={styles.title}>GitHub Activity</h2>
        <p className={styles.updated}>
          Last synced:{" "}
          <time dateTime={profile.fetchedAt}>
            {new Date(profile.fetchedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </p>
      </div>

      {/* Pinned Repos */}
      {profile.pinnedRepos.length > 0 && (
        <div className={styles.repos}>
          {profile.pinnedRepos.map((repo) => (
            <GlassCard key={repo.name} hover className={styles.repo}>
              <div className={styles.repoHeader}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.repoName}
                >
                  {repo.name}
                </a>
                {repo.primaryLanguage && (
                  <Badge variant="outline">{repo.primaryLanguage}</Badge>
                )}
              </div>
              {repo.description && (
                <p className={styles.repoDesc}>{repo.description}</p>
              )}
              <div className={styles.repoStats}>
                <span>★ {repo.stargazerCount}</span>
                <span>⑂ {repo.forkCount}</span>
              </div>
              {repo.matchedProjectSlug && (
                <Link
                  href={`/projects/${repo.matchedProjectSlug}`}
                  className={styles.caseStudyLink}
                >
                  View Case Study →
                </Link>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Contribution Summary */}
      {profile.totalContributions > 0 && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{profile.totalContributions.toLocaleString()}</strong>
            <span>Contributions (past year)</span>
          </div>
          <div className={styles.stat}>
            <strong>{profile.currentStreak}</strong>
            <span>Day Streak</span>
          </div>
          <div className={styles.stat}>
            <strong>{profile.totalPublicRepos}</strong>
            <span>Public Repos</span>
          </div>
        </div>
      )}
    </section>
  );
}
