import type { Metadata } from "next";
import dhruvImage from "@/assets/Dhruv_Image.jpg";
import {
  ABOUT_PATH,
  absoluteUrl,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  GITHUB_URL,
  LINKEDIN_URL,
  PERSON_DESCRIPTION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

const DEFAULT_DESCRIPTION = SITE_DESCRIPTION;

/**
 * One stable identifier for the person, so the site-wide Person block and the
 * `author` of every article resolve to the same entity.
 */
export const PERSON_ID = `${SITE_URL}/#person`;

/**
 * Absolute URL of a raster portrait for schema.org `image`. Next's static
 * import yields `{ src }` (a hashed /_next/static/media URL); Vite (unit
 * tests) yields the URL string itself. The SVG monogram is not used here:
 * rich-result images should be raster.
 */
const dhruvImageSrc: string =
  typeof (dhruvImage as unknown) === "string"
    ? (dhruvImage as unknown as string)
    : dhruvImage.src;
export const PERSON_IMAGE_URL = absoluteUrl(dhruvImageSrc);

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string[];
  category?: string;
  article?: {
    publishedTime?: string;
    /** Optional: emitted as `article:modified_time` when provided. */
    modifiedTime?: string;
    author?: string;
  };
}

/**
 * Normalises a frontmatter / JSON date to `YYYY-MM-DD` (or the string as
 * authored). gray-matter turns an unquoted YAML date into a `Date`, a quoted
 * one stays a string, and `null` / empty means "no date": callers must then
 * omit the field rather than invent one.
 */
export function contentDate(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  return undefined;
}

/**
 * Squeezes an arbitrary blurb into a search-result-safe meta description.
 *
 * Blog `excerpt` and case-study `tldr` are authored for humans reading the
 * page, so they can carry inline markdown and run well past what Google will
 * show. This flattens the markup, collapses whitespace, and — only when the
 * text is genuinely over budget — cuts at the last word boundary and closes
 * with a single "…". The ellipsis counts toward `max`, so the return value is
 * never longer than `max`.
 */
export function truncateDescription(text: string, max = 160): string {
  const flattened = text
    // Inline HTML first, so <em>word</em> does not leave stray angle brackets.
    .replace(/<[^>]*>/g, " ")
    // Images and links collapse to their alt text / label.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Inline code, emphasis, headings, blockquote and list markers.
    .replace(/`+/g, "")
    .replace(/(\*\*|__|~~|\*|_)/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}[-+*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (flattened.length <= max) {
    return flattened;
  }

  // Reserve the last character for the ellipsis.
  const budget = flattened.slice(0, max - 1);
  const lastSpace = budget.lastIndexOf(" ");
  const cut = lastSpace > max * 0.5 ? budget.slice(0, lastSpace) : budget;

  // Never leave dangling punctuation immediately before the ellipsis.
  return `${cut.replace(/[\s,;:.\-—–]+$/u, "")}…`;
}

export function generatePageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  ogImage = path ? `/og${path}` : "/og",
  ogType = "website",
  keywords,
  category,
  article,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path || "/");
  const socialTitle = title === SITE_TITLE || title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  // One flattened, length-capped string feeds the meta tag and both social
  // cards, so a long blog excerpt can never leak past 160 chars anywhere.
  const metaDescription = truncateDescription(description);

  return {
    title: path === "" ? { absolute: title } : title,
    description: metaDescription,
    ...(keywords?.length ? { keywords } : {}),
    ...(category ? { category } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: ogType,
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630, alt: socialTitle }],
      ...(article && {
        publishedTime: article.publishedTime,
        ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
        // OG `article:author` expects a profile URL, not a display name.
        authors: article.author
          ? [article.author === SITE_NAME ? absoluteUrl(ABOUT_PATH) : article.author]
          : undefined,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: metaDescription,
      images: [absoluteUrl(ogImage)],
    },
  };
}

/**
 * The person as an article/page author: name, profile page and the profiles
 * that confirm the identity. No `jobTitle` and no `worksFor`: both would be
 * undated present-tense claims (owner decision, 3 Oct 2026).
 */
export function generateAuthorPerson() {
  return {
    "@type": "Person" as const,
    "@id": PERSON_ID,
    name: SITE_NAME,
    url: absoluteUrl(ABOUT_PATH),
    image: PERSON_IMAGE_URL,
    sameAs: [LINKEDIN_URL, GITHUB_URL],
  };
}

export function generatePersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME,
    url: SITE_URL,
    mainEntityOfPage: absoluteUrl(ABOUT_PATH),
    image: PERSON_IMAGE_URL,
    description: PERSON_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "J.C. Bose University",
    },
    knowsAbout: ["E-commerce Product Management", "Product Analytics", "AI/ML", "Data Science"],
    sameAs: [GITHUB_URL, LINKEDIN_URL],
  };
}

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    publisher: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

/**
 * BlogPosting (a schema.org Article subtype) for a post. `dateModified` is
 * optional: pass the post's `updatedDate`; without one, or with one earlier
 * than publication, it falls back to `datePublished` so it is never earlier.
 */
export function generateArticleJsonLd(article: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string | null;
  url: string;
  image?: string;
}) {
  const modified = contentDate(article.dateModified);
  const dateModified =
    modified && modified >= article.datePublished ? modified : article.datePublished;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified,
    author: generateAuthorPerson(),
    publisher: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SITE_NAME,
      url: SITE_URL,
      image: PERSON_IMAGE_URL,
    },
    mainEntityOfPage: absoluteUrl(article.url),
    url: absoluteUrl(article.url),
    image: absoluteUrl(article.image || `/og${article.url}`),
    inLanguage: "en-US",
  };
}
