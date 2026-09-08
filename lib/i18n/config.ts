import type { Locale } from "@/types";

export const locales: readonly Locale[] = ["uz", "ru"] as const;
export const defaultLocale: Locale = "uz";

export function isLocale(value: string | undefined): value is Locale {
  return value === "uz" || value === "ru";
}

/** Public URL for a path in a given locale. Uzbek lives at the root, Russian under /ru. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === "uz") return clean;
  return clean === "/" ? "/ru" : `/ru${clean}`;
}

/** Locale-specific `lang` attribute values. */
export const htmlLang: Record<Locale, string> = { uz: "uz", ru: "ru" };

/** BCP-47 tags for number/date formatting. */
export const intlLocale: Record<Locale, string> = { uz: "uz-Latn-UZ", ru: "ru-RU" };

export const localeNames: Record<Locale, string> = { uz: "Oʻzbekcha", ru: "Русский" };
export const localeShort: Record<Locale, string> = { uz: "UZ", ru: "RU" };
