import { notFound } from "next/navigation";
import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import {
  getAllCaseStudySlugs,
  getCaseStudyBySlug,
  getAllProjects,
} from "@/lib/content";
import { ProductMasthead } from "@/components/case-study/ProductMasthead";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { ChapterRail } from "@/components/case-study/ChapterRail";
import { MetricChart } from "@/components/case-study/MetricChart";
import { MdxContent } from "@/components/case-study/MdxContent";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { RelatedWork } from "@/components/case-study/RelatedWork";
import { JsonLd } from "@/components/ui/JsonLd";
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

  return (
    <div className={styles.page}>
      <JsonLd id="case-study-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      <JsonLd id="case-study-creative-work-jsonld" data={creativeWorkJsonLd} />

      {/* Product identity: name, tagline, audience, status, try/source. */}
      {currentProject && <ProductMasthead project={currentProject} />}

      {/* Header: h1, spec table, framed shot */}
      <CaseStudyHero
        caseStudy={caseStudy}
        imageUrl={currentProject?.imageUrl}
        imageAlt={currentProject?.imageAlt}
        liveUrl={currentProject?.liveUrl}
        accent={currentProject?.accent}
        demoVideo={currentProject?.demoVideo}
        belowMasthead={Boolean(currentProject)}
      />

      {/* TL;DR */}
      <section className={styles.tldr} aria-label="Summary">
        <h2 className={styles.tldrTitle}>TL;DR</h2>
        <p className={styles.tldrText}>{caseStudy.tldr}</p>
      </section>

      {/* Metrics */}
      <section className={styles.metricsSection} aria-label="Key metrics">
        <MetricChart metrics={caseStudy.metrics} />
      </section>

      {/* Body: sticky chapter rail beside the article on wide screens. The rail
          reads the article's h2s from the DOM after mount. */}
      <div className={styles.body}>
        <ChapterRail className={styles.rail} />
        <article aria-label="Case study content" className={styles.article}>
          <MdxContent source={caseStudy.content} slug={slug} />
        </article>
      </div>

      {/* Related Work */}
      <RelatedWork
        currentSlug={slug}
        currentCategory={currentProject?.category ?? "product"}
        allProjects={allProjects}
      />

      {/* Navigation */}
      <CaseStudyNav prevSlug={caseStudy.prevSlug} nextSlug={caseStudy.nextSlug} />
    </div>
  );
}
