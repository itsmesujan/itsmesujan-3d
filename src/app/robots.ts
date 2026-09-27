import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    // Derived, not typed twice: a domain change cannot leave this behind.
    sitemap: `${site.url}/sitemap.xml`,
  };
}
