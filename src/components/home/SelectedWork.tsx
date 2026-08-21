import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import { MetricCounter } from "@/components/ui/MetricCounter";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatCategoryLabel } from "@/lib/utils";
import styles from "./SelectedWork.module.css";

interface SelectedWorkProps {
  projects: Project[];
}

/**
 * The dossier openings: each flagship reads like the front page of its case
 * study — title, exact ownership, outcome, metric over the blue baseline —
 * with the screenshot clipped to the row like an attachment. The remaining
 * featured work compresses to index rows underneath.
 */
export function SelectedWork({ projects }: SelectedWorkProps) {
  const flagships = projects.filter((p) => p.tier === "flagship");
  const rest = projects.filter((p) => p.tier !== "flagship" && p.featured);

  return (
    <div className={styles.wrap}>
      <div className={styles.flagships}>
        {flagships.map((project) => (
          <article key={project.slug} className={styles.flagship}>
            {project.imageUrl && (
              <Link
                href={`/projects/${project.slug}`}
                className={styles.media}
                aria-label={`${project.name} — case study`}
                tabIndex={-1}
              >
                <Image
                  src={project.imageUrl}
                  alt={project.imageAlt ?? `${project.name} screenshot`}
                  fill
                  className={styles.mediaImage}
                  sizes="(max-width: 900px) 100vw, 48vw"
                />
              </Link>
            )}

            <div className={styles.body}>
              <p className={styles.rail}>
                <span>{project.duration}</span>
                <span className={styles.railSep} aria-hidden="true">
                  &middot;
                </span>
                <span>{formatCategoryLabel(project.category)}</span>
              </p>

              <h3 className={styles.title}>
                <Link href={`/projects/${project.slug}`}>{project.name}</Link>
              </h3>

              <p className={styles.myPart}>{project.role}</p>
              <p className={styles.desc}>{project.description}</p>

              <div className={styles.metric}>
                <MetricCounter
                  value={project.metricValue}
                  label={project.metricLabel}
                  size="sm"
                />
              </div>

              <div className={styles.actions}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={styles.cta}
                >
                  Case study &rarr;
                </Link>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    className={styles.ctaLive}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live app &#8599;
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {rest.length > 0 && (
        <div className={styles.also}>
          <h3 className={styles.alsoHeading}>Also built</h3>
          <ListRows>
            {rest.map((project) => (
              <ListRow
                key={project.slug}
                href={`/projects/${project.slug}`}
                title={project.name}
                dek={project.description}
                rail={
                  <>
                    <span>{project.metricValue}</span>
                    <span>{project.metricLabel}</span>
                  </>
                }
              />
            ))}
          </ListRows>
          <div className={styles.viewAll}>
            <Link href="/projects" className={styles.viewAllLink}>
              All projects &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
