import type { GitHubProfile } from "@/types/github";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./GitHubStats.module.css";

interface GitHubStatsProps {
  profile: GitHubProfile;
}

export function GitHubStats({ profile }: GitHubStatsProps) {
  if (profile.totalContributions === 0 && profile.totalPublicRepos === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.cards}>
        <GlassCard className={styles.card}>
          <span className={styles.value}>{profile.totalPublicRepos}</span>
          <span className={styles.label}>Public Repos</span>
        </GlassCard>
        <GlassCard className={styles.card}>
          <span className={styles.value}>
            {profile.totalContributions.toLocaleString()}
          </span>
          <span className={styles.label}>Contributions</span>
        </GlassCard>
        <GlassCard className={styles.card}>
          <span className={styles.value}>{profile.currentStreak}</span>
          <span className={styles.label}>Day Streak</span>
        </GlassCard>
      </div>

      {profile.topLanguages.length > 0 && (
        <div className={styles.languages}>
          <span className={styles.langTitle}>Top Languages</span>
          <div className={styles.langList}>
            {profile.topLanguages.map((lang) => (
              <Badge key={lang.name} variant="outline">
                {lang.name} ({lang.percentage}%)
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className={styles.synced}>
        Last synced:{" "}
        <time dateTime={profile.fetchedAt}>
          {new Date(profile.fetchedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </time>
      </p>
    </div>
  );
}
