import type { Metadata } from "next";
import {
  absoluteUrl,
  CONTACT_EMAIL,
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

  return {
    title: path === "" ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    ...(category ? { category } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
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
      description,
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
