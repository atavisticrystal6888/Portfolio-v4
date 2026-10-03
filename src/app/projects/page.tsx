import { generatePageMetadata } from "@/lib/metadata";
import { getAllProjects } from "@/lib/content";
import { getGitHubProfile } from "@/lib/github";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { GitHubActivity } from "@/components/projects/GitHubActivity";
import { WhereNext, DESTINATIONS } from "@/components/ui/WhereNext";
import Link from "next/link";
import styles from "./projects.module.css";

export const metadata = generatePageMetadata({
  title: "Projects",
  description:
    "Product case studies by Dhruv Singhal: the problem, the scope call, what was built, and what the evidence does and does not show, limits included.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = getAllProjects();
  const github = await getGitHubProfile();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Projects", href: "/projects" },
        ]}
        title="Projects"
        subtitle="Each entry: the problem, the decision I made, who built it, where it runs, and how strong the evidence is."
        meta={`${projects.length} project${projects.length !== 1 ? "s" : ""} · status, contribution and evidence tier on every entry`}
      />

      <p className={styles.labNote}>
        Looking for unbuilt ideas?{" "}
        <Link href="/lab" className={styles.labLink}>
          See the Lab backlog
        </Link>
      </p>

      <ProjectGrid projects={projects} />

      <GitHubActivity profile={github} />

      <WhereNext
        destinations={[DESTINATIONS.aiPm, DESTINATIONS.blog, DESTINATIONS.contact]}
      />
    </>
  );
}
