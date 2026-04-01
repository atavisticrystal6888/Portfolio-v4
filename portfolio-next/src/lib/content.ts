import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project } from "@/types/project";
import type { CaseStudyFrontmatter, CaseStudy } from "@/types/project";
import type { BlogArticleFrontmatter, BlogArticle } from "@/types/blog";
import type { Testimonial } from "@/types/testimonial";

const contentDir = path.join(process.cwd(), "content");

export function getAllProjects(): Project[] {
  const filePath = path.join(contentDir, "projects.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const projects: Project[] = JSON.parse(raw);
  return projects.sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  const dir = path.join(contentDir, "case-studies");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
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

export function getBlogPostBySlug(slug: string): BlogArticle | null {
  const filePath = path.join(contentDir, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as BlogArticleFrontmatter), content };
}

export function getAllBlogPosts(): BlogArticle[] {
  return getAllBlogSlugs()
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogArticle => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTestimonials(): Testimonial[] {
  const filePath = path.join(contentDir, "testimonials.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
