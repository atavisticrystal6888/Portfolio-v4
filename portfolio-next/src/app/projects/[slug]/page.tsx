import { notFound } from "next/navigation";
import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import {
  getAllCaseStudySlugs,
  getCaseStudyBySlug,
} from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { MetricChart } from "@/components/case-study/MetricChart";
import { MdxContent } from "@/components/case-study/MdxContent";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrintButton } from "@/components/ui/PrintButton";
import { DemoEmbed } from "@/components/ui/DemoEmbed";
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { MobileTOC } from "@/components/case-study/MobileTOC";
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

      {/* Actions */}
      <div className={styles.actions}>
        <PrintButton />
      </div>

      {/* Video/Demo Embed */}
      {(caseStudy.videoUrl || caseStudy.demoUrl) && (
        <section className={styles.demoSection} aria-label="Demo">
          <DemoEmbed
            url={(caseStudy.videoUrl || caseStudy.demoUrl)!}
            title={`${caseStudy.title} demo`}
          />
        </section>
      )}

      {/* TL;DR */}
      <section className={styles.tldr} aria-label="Summary">
        <GlassCard className={styles.tldrCard}>
          <h2 className={styles.tldrTitle}>TL;DR</h2>
          <p className={styles.tldrText}>{caseStudy.tldr}</p>
        </GlassCard>
      </section>

      {/* Metrics */}
      <section className={styles.metricsSection} aria-label="Key metrics">
        <MetricChart metrics={caseStudy.metrics} />
      </section>

      {/* Content with sticky TOC */}
      <div className={styles.contentLayout}>
        <article className={styles.mainContent} aria-label="Case study content">
          <MdxContent html={contentHtml} />
        </article>
        <aside className={styles.sidebar}>
          <TableOfContents />
        </aside>
      </div>

      {/* Mobile floating TOC */}
      <MobileTOC />

      {/* Navigation */}
      <CaseStudyNav prevSlug={caseStudy.prevSlug} nextSlug={caseStudy.nextSlug} />
      <ScrollDepthTracker />
    </div>
  );
}
