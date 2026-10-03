import { getAllBlogPosts, getAllProjects } from "@/lib/content";
import { LATEST_RELEASE } from "@/lib/changelog";

/**
 * The site's "Last updated" date: the newest dated change anywhere in the
 * published content (article date or updatedDate, a project's lastVerified,
 * or the latest changelog release), so the footer can never claim an older
 * date than an article that says it was updated later.
 */
export function getSiteLastUpdated(): { iso: string; label: string } {
  const candidates: number[] = [];
  const push = (value: string | null | undefined) => {
    if (!value) return;
    const t = Date.parse(value);
    if (!Number.isNaN(t)) candidates.push(t);
  };
  for (const post of getAllBlogPosts()) {
    push(post.date);
    push(post.updatedDate);
  }
  for (const project of getAllProjects()) push(project.lastVerified);
  push(LATEST_RELEASE.date);

  const newest = new Date(Math.max(...candidates));
  return {
    iso: newest.toISOString().slice(0, 10),
    label: newest.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
  };
}
