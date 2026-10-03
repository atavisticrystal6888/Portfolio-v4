import { notFound } from "next/navigation";
import { generatePageMetadata, generateAuthorPerson } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";
import { selectStripMetrics } from "@/components/case-study/MetricChart";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import {
  getAllCaseStudySlugs,
  getCaseStudyBySlug,
  getAllProjects,
} from "@/lib/content";
import { ProductMasthead } from "@/components/case-study/ProductMasthead";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { ChapterRail } from "@/components/case-study/ChapterRail";
import { ChapterMenu } from "@/components/case-study/ChapterMenu";
import { MetricChart } from "@/components/case-study/MetricChart";
import { MdxContent } from "@/components/case-study/MdxContent";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { RelatedWork } from "@/components/case-study/RelatedWork";
import { JsonLd } from "@/components/ui/JsonLd";
import styles from "./case-study.module.css";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

/** Only the ten known slugs render; anything else (including mixed case) 404s. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) return {};

  return generatePageMetadata({
    title: caseStudy.seoTitle ?? caseStudy.title,
    // A written 120-160 character description; the TL;DR is only a fallback
    // because truncating it cuts the sentence before its point.
    description: caseStudy.metaDescription ?? caseStudy.tldr,
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
  const productNameOf = (target: string) => {
    const project = allProjects.find((p) => p.slug === target);
    return project?.productName ?? project?.name;
  };

  // The visible trail and the page's only BreadcrumbList JSON-LD both come
  // from <Breadcrumbs> inside the masthead.
  const breadcrumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    {
      name: currentProject?.productName ?? currentProject?.name ?? caseStudy.title,
      href: `/projects/${slug}`,
    },
  ];

  // Co-builders are credited in the structured data too; a solo study lists
  // only the author.
  const coCreators = caseStudy.coCreators ?? currentProject?.coCreators ?? [];
  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: caseStudy.title,
    description: caseStudy.metaDescription ?? caseStudy.tldr,
    url: absoluteUrl(`/projects/${slug}`),
    image: absoluteUrl(`/og/projects/${slug}`),
    ...(currentProject?.lastVerified && { dateModified: currentProject.lastVerified }),
    author: generateAuthorPerson(),
    ...(coCreators.length > 0 && {
      contributor: coCreators.map((c) => ({
        "@type": "Person",
        name: c.name,
        url: c.url,
      })),
    }),
  };

  const stripMetrics = selectStripMetrics(caseStudy.metrics ?? []);

  return (
    <div className={styles.page}>
      <JsonLd id="case-study-creative-work-jsonld" data={creativeWorkJsonLd} />

      {/* Product identity: name, tagline, audience, status, try/source. */}
      {currentProject && (
        <ProductMasthead
          project={currentProject}
          title={caseStudy.title}
          heroNote={caseStudy.heroNote}
          alternative={caseStudy.alternative}
          tradeoff={caseStudy.tradeoff}
          breadcrumbs={breadcrumbs}
        />
      )}
      {!currentProject && <Breadcrumbs items={breadcrumbs} />}

      {/* Header: subtitle, spec table, framed shot (the h1 when there is no masthead) */}
      <CaseStudyHero
        caseStudy={caseStudy}
        imageUrl={currentProject?.heroImageUrl ?? currentProject?.imageUrl}
        zoomSrc={currentProject?.imageUrl ?? undefined}
        imageAlt={currentProject?.imageAlt}
        liveUrl={currentProject?.liveUrl}
        accent={currentProject?.accent}
        demoVideo={currentProject?.demoVideo}
        imageCaption={currentProject?.imageCaption}
        team={currentProject?.team}
        belowMasthead={Boolean(currentProject)}
      />

      {/* TL;DR */}
      <section className={styles.tldr} aria-label="Summary">
        <h2 className={styles.tldrTitle}>TL;DR</h2>
        <p className={styles.tldrText}>{caseStudy.tldr}</p>
      </section>

      {/* Metrics: no empty ruled section when a study has no tile worth showing. */}
      {stripMetrics.length > 0 && (
        <section className={styles.metricsSection} aria-label="Key metrics">
          <MetricChart metrics={caseStudy.metrics} />
        </section>
      )}

      {/* Body: sticky chapter rail beside the article on wide screens; below
          1200px a "Chapters" disclosure sits at the top of the article
          instead. Both read the article's h2s from the DOM after mount. */}
      <div className={styles.body}>
        <ChapterRail className={styles.rail} />
        <ChapterMenu className={styles.menu} />
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
      <CaseStudyNav
        prevSlug={caseStudy.prevSlug}
        nextSlug={caseStudy.nextSlug}
        prevName={productNameOf(caseStudy.prevSlug)}
        nextName={productNameOf(caseStudy.nextSlug)}
      />
    </div>
  );
}
