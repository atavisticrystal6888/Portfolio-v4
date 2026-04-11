"use client";

import Link from "next/link";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import styles from "./ComparisonTable.module.css";

interface ComparisonTableProps {
  projects: Project[];
}

export function ComparisonTable({ projects }: ComparisonTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyCol}>Project</th>
            <th>Role</th>
            <th>Stack</th>
            <th>Key Metric</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.slug}>
              <td className={styles.stickyCol}>
                <Link href={`/projects/${project.slug}`} className={styles.projectLink}>
                  {project.name}
                </Link>
              </td>
              <td className={styles.role}>{project.role}</td>
              <td>
                <div className={styles.stackList}>
                  {project.stack.slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                  ))}
                  {project.stack.length > 4 && (
                    <Badge variant="outline">+{project.stack.length - 4}</Badge>
                  )}
                </div>
              </td>
              <td>
                <span className={styles.metricValue}>{project.metricValue}</span>
                <span className={styles.metricLabel}>{project.metricLabel}</span>
              </td>
              <td className={styles.duration}>{project.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
