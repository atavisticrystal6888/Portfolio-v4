import type { Metadata } from "next";
import {
  absoluteUrl,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  GITHUB_URL,
  HEADSHOT_PATH,
  LINKEDIN_URL,
  PERSON_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

const DEFAULT_DESCRIPTION = SITE_DESCRIPTION;

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
    author?: string;
  };
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
        authors: article.author ? [article.author] : undefined,
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

export function generatePersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    jobTitle: PERSON_TITLE,
    url: SITE_URL,
    image: absoluteUrl(HEADSHOT_PATH),
    description: SITE_DESCRIPTION,
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

export function generateArticleJsonLd(article: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
      image: absoluteUrl(HEADSHOT_PATH),
    },
    mainEntityOfPage: absoluteUrl(article.url),
    url: absoluteUrl(article.url),
    image: absoluteUrl(article.image || `/og${article.url}`),
  };
}
