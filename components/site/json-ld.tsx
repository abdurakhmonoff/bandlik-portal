import type { Locale, Organization, Vacancy } from "@/types";
import { hokimlik } from "@/data/organization";
import { localePath } from "@/lib/i18n/config";
import { getMahalla, getSectorById } from "@/lib/vacancies";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandlik.qiziltepa.uz";

export function absolute(locale: Locale, path: string): string {
  return SITE_URL + localePath(locale, path);
}

/** Renders a JSON-LD script tag. Content is trusted (built from our own data). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function governmentOrganization(locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: hokimlik.name[locale],
    url: SITE_URL,
    logo: `${SITE_URL}/brand/icon-512.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: hokimlik.address[locale],
      addressLocality: locale === "ru" ? "Кызылтепа" : "Qiziltepa",
      addressRegion: locale === "ru" ? "Навоийская область" : "Navoiy viloyati",
      addressCountry: "UZ",
    },
    telephone: hokimlik.phones[0]?.phone,
    areaServed: { "@type": "AdministrativeArea", name: locale === "ru" ? "Кызылтепинский район" : "Qiziltepa tumani" },
  };
}

export function breadcrumbList(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

const EMPLOYMENT_SCHEMA: Record<Vacancy["employmentType"], string> = {
  permanent: "FULL_TIME",
  "fixed-term": "CONTRACTOR",
  seasonal: "TEMPORARY",
  internship: "INTERN",
  daily: "PER_DIEM",
};

export function jobPosting(v: Vacancy, org: Organization | undefined, locale: Locale): Record<string, unknown> {
  const mahalla = v.mahallaId ? getMahalla(v.mahallaId) : undefined;
  const sector = getSectorById(v.sectorId);
  const description =
    v.description?.[locale] ??
    [...v.requirements.map((r) => r[locale]), ...v.conditions.map((c) => c[locale])].join(". ");
  const salary =
    v.salaryMin || v.salaryMax
      ? {
          "@type": "MonetaryAmount",
          currency: "UZS",
          value: {
            "@type": "QuantitativeValue",
            ...(v.salaryMin && v.salaryMax
              ? { minValue: v.salaryMin, maxValue: v.salaryMax }
              : { value: v.salaryMax ?? v.salaryMin }),
            unitText: v.paymentType === "hourly" ? "HOUR" : v.paymentType === "piecework" ? "DAY" : "MONTH",
          },
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.title[locale],
    description,
    datePosted: v.publishedAt,
    ...(v.expiresAt ? { validThrough: v.expiresAt } : {}),
    employmentType: EMPLOYMENT_SCHEMA[v.employmentType],
    industry: sector.name[locale],
    occupationalCategory: v.title[locale],
    totalJobOpenings: v.openings,
    directApply: false,
    url: absolute(locale, `/vakansiyalar/${v.slug}`),
    identifier: { "@type": "PropertyValue", name: "Oson Ish", value: String(v.sourceId) },
    hiringOrganization: org
      ? { "@type": "Organization", name: org.name[locale], sameAs: absolute(locale, `/tashkilotlar/${org.slug}`) }
      : undefined,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: v.address ?? undefined,
        addressLocality: mahalla ? `${mahalla.name[locale]}, ${locale === "ru" ? "Кызылтепа" : "Qiziltepa"}` : locale === "ru" ? "Кызылтепа" : "Qiziltepa",
        addressRegion: locale === "ru" ? "Навоийская область" : "Navoiy viloyati",
        addressCountry: "UZ",
      },
    },
    ...(salary ? { baseSalary: salary } : {}),
    ...(v.experience === "none" ? { experienceRequirements: "no requirements" } : {}),
    ...(v.educationLevel === "bachelor" || v.educationLevel === "master"
      ? { educationRequirements: { "@type": "EducationalOccupationalCredential", credentialCategory: "bachelor degree" } }
      : {}),
    workHours: v.workingHours ? `${v.workingHours.from}-${v.workingHours.to}` : undefined,
    jobLocationType: v.workMode === "remote" ? "TELECOMMUTE" : undefined,
  };
}
