import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project } from "@/types/project";
import type { CaseStudyFrontmatter, CaseStudy } from "@/types/project";
import type { BlogArticleFrontmatter, BlogArticle } from "@/types/blog";
import type { Testimonial } from "@/types/testimonial";
import type { LabIdea } from "@/types/lab";
import { assertApprovedCaseStudies } from "../../scripts/lib/case-study-allowlist.mjs";

const contentDir = path.join(process.cwd(), "content");

export function getAllProjects(): Project[] {
  const filePath = path.join(contentDir, "projects.json");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const projects: Project[] = JSON.parse(raw);
  return projects.sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

/**
 * The published case-study slugs. This is the build-time publication gate:
 * it throws unless every content/case-studies/*.mdx is in
 * content/approved-case-studies.json (and vice versa, with no withdrawn route
 * approved or present), so generateStaticParams, sitemap.ts and the OG route
 * make `next build` fail on an unapproved draft. On success the approved list
 * equals the sorted .mdx set. Rules: scripts/lib/case-study-allowlist.mjs.
 */
export function getAllCaseStudySlugs(): string[] {
  return assertApprovedCaseStudies(process.cwd());
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  // Exact match against the real file names: on a case-insensitive file
  // system (NTFS) "/projects/Aarchid" would otherwise find aarchid.mdx and
  // render a duplicate page with a mixed-case canonical.
  if (!getAllCaseStudySlugs().includes(slug)) return null;
  const filePath = path.join(contentDir, "case-studies", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as CaseStudyFrontmatter), content };
}

export function getAllCaseStudies(): CaseStudy[] {
  return getAllCaseStudySlugs()
    .map((slug) => getCaseStudyBySlug(slug))
    .filter((cs): cs is CaseStudy => cs !== null);
}

export function getAllBlogSlugs(): string[] {
  const dir = path.join(contentDir, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Reading speed behind the "N min read" label: 200 words a minute. */
export const READING_WPM = 200;

/**
 * "N min read" computed from the markdown body, so the label cannot drift
 * from the text. Link targets, markup and table rules are not words; code is
 * counted, since readers read it too.
 */
export function readingTimeFor(markdown: string): string {
  const text = markdown
    .replace(/\]\([^)]*\)/g, "]") // link and image targets
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, " "); // table separator rows
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’._-]*/gu)?.length ?? 0;
  return `${Math.max(1, Math.ceil(words / READING_WPM))} min read`;
}

export function getBlogPostBySlug(slug: string): BlogArticle | null {
  // Exact match only (see getCaseStudyBySlug): mixed-case slugs must 404.
  if (!getAllBlogSlugs().includes(slug)) return null;
  const filePath = path.join(contentDir, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as BlogArticleFrontmatter;
  return {
    ...fm,
    updatedDate: fm.updatedDate ?? null,
    readingTime: readingTimeFor(content),
    content,
  };
}

export function getAllBlogPosts(): BlogArticle[] {
  return getAllBlogSlugs()
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogArticle => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const RELATED_COUNT = 2;

/**
 * "Related reading" for a post. Curated first: the post's `related` slugs, in
 * order, are the author's pick for the next read. Any gap (missing or unknown
 * slug) is filled by tag overlap plus a same-category bonus, which on its own
 * is topic-blind when most posts share one category.
 */
export function pickRelatedPosts(current: BlogArticle, allPosts: BlogArticle[]): BlogArticle[] {
  const others = allPosts.filter((p) => p.slug !== current.slug);
  const curated = (current.related ?? [])
    .map((slug) => others.find((p) => p.slug === slug))
    .filter((p): p is BlogArticle => p !== undefined);
  const scored = others
    .filter((p) => !curated.includes(p))
    .map((p) => {
      const tagOverlap = p.tags.filter((t) => current.tags.includes(t)).length;
      const catMatch = p.category === current.category ? 2 : 0;
      return { post: p, score: tagOverlap + catMatch };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
  return [...curated, ...scored].slice(0, RELATED_COUNT);
}

export function getAllTestimonials(): Testimonial[] {
  const filePath = path.join(contentDir, "testimonials.json");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function getAllLabIdeas(): LabIdea[] {
  const filePath = path.join(contentDir, "lab", "ideas.json");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
