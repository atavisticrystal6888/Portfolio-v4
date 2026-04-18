import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { getAllProjects } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectGrid } from "@/components/projects/ProjectGrid";

export const metadata = generatePageMetadata({
  title: "Projects",
  description:
    "Explore Dhruv Singhal's projects — product builds, data analyses, and technical work with measurable outcomes.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getAllProjects();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHeader
        title="Projects"
        subtitle="Problem → Action → Outcome"
        badge={`${projects.length} Project${projects.length !== 1 ? "s" : ""}`}
      />

      <ProjectGrid projects={projects} />
    </>
  );
}
