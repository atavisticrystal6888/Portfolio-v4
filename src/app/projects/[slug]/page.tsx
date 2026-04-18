import { notFound } from "next/navigation";
import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import {
  getAllCaseStudySlugs,
  getCaseStudyBySlug,
  getAllProjects,
} from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { MetricChart } from "@/components/case-study/MetricChart";
import { MdxContent } from "@/components/case-study/MdxContent";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { RelatedWork } from "@/components/case-study/RelatedWork";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "./case-study.module.css";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) return {};

  return generatePageMetadata({
    title: caseStudy.title,
    description: caseStudy.tldr,
    path: `/projects/${slug}`,
  });
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  const allProjects = getAllProjects();
  const currentProject = allProjects.find((p) => p.slug === slug);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
    { name: caseStudy.title, url: `/projects/${slug}` },
  ]);

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: caseStudy.title,
    description: caseStudy.tldr,
    author: { "@type": "Person", name: "Dhruv Singhal" },
  };

  const contentHtml = markdownToHtml(caseStudy.content);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkJsonLd) }}
      />

      {/* Header */}
      <CaseStudyHero caseStudy={caseStudy} />

      {/* TL;DR */}
      <ScrollReveal>
        <section className={styles.tldr} aria-label="Summary">
          <GlassCard className={styles.tldrCard}>
            <h2 className={styles.tldrTitle}>TL;DR</h2>
            <p className={styles.tldrText}>{caseStudy.tldr}</p>
          </GlassCard>
        </section>
      </ScrollReveal>

      {/* Metrics */}
      <ScrollReveal delay={0.1}>
        <section className={styles.metricsSection} aria-label="Key metrics">
          <MetricChart metrics={caseStudy.metrics} />
        </section>
      </ScrollReveal>

      {/* Content */}
      <ScrollReveal delay={0.15}>
        <article aria-label="Case study content">
          <MdxContent html={contentHtml} />
        </article>
      </ScrollReveal>

      {/* Related Work */}
      <ScrollReveal delay={0.1}>
        <RelatedWork
          currentSlug={slug}
          currentCategory={currentProject?.category ?? "product"}
          allProjects={allProjects}
        />
      </ScrollReveal>

      {/* Navigation */}
      <CaseStudyNav prevSlug={caseStudy.prevSlug} nextSlug={caseStudy.nextSlug} />
    </div>
  );
}
