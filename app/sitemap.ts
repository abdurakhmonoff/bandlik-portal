import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/site/json-ld";
import { localePath, locales } from "@/lib/i18n/config";
import { getAll, getOrganizations, getSectors } from "@/lib/vacancies";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = ["/", "/vakansiyalar", "/tashkilotlar", "/tuman", "/yordam", "/aloqa"];
  const entries: MetadataRoute.Sitemap = [];
  const push = (path: string, changeFrequency: "daily" | "weekly" | "monthly", priority: number, lastModified?: string) => {
    for (const locale of locales) {
      entries.push({
        url: SITE_URL + localePath(locale, path),
        lastModified: lastModified ?? "2026-09-08",
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + localePath(l, path)])),
        },
      });
    }
  };
  for (const s of statics) push(s, s === "/" || s === "/vakansiyalar" ? "daily" : "monthly", s === "/" ? 1 : 0.8);
  for (const s of getSectors()) push(`/sohalar/${s.slug}`, "weekly", 0.7);
  for (const o of getOrganizations()) push(`/tashkilotlar/${o.slug}`, "weekly", 0.5);
  for (const v of getAll()) push(`/vakansiyalar/${v.slug}`, "weekly", 0.6, v.publishedAt);
  return entries;
}
