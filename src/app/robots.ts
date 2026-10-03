import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    // No `host`: it is a non-standard (Yandex-only) directive Google ignores.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
