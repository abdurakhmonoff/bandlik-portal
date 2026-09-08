import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/site/json-ld";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/uz/", "/saqlangan", "/ru/saqlangan", "/admin"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
