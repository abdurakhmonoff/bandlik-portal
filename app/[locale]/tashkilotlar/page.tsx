import type { Metadata } from "next";
import Link from "next/link";
import type { Locale, OrganizationType } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages, orgTypeLabels } from "@/lib/i18n/messages";
import { getOrganizationsWithCounts, getSectorById, getMahalla } from "@/lib/vacancies";
import { Avatar } from "@/components/ui/avatar";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";
import { cn } from "@/lib/utils";

type Params = Promise<{ locale: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;
const TYPES: OrganizationType[] = ["school", "kindergarten", "llc", "state", "private"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    title: m.orgs.metaTitle,
    description: m.orgs.metaDescription,
    alternates: { canonical: localePath(locale, "/tashkilotlar"), languages: { uz: "/tashkilotlar", ru: "/ru/tashkilotlar" } },
  };
}

export default async function OrganizationsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  const sp = await searchParams;
  const type = typeof sp.tur === "string" && (TYPES as string[]).includes(sp.tur) ? (sp.tur as OrganizationType) : undefined;
  const all = getOrganizationsWithCounts();
  const list = type ? all.filter((o) => o.organization.type === type) : all;
  const base = localePath(locale, "/tashkilotlar");
  const typeCounts = Object.fromEntries(TYPES.map((t) => [t, all.filter((o) => o.organization.type === t).length])) as Record<OrganizationType, number>;

  return (
    <div className="site-container pb-16 pt-8 sm:pt-10">
      <JsonLd data={breadcrumbList([{ name: m.nav.home, url: absolute(locale, "/") }, { name: m.orgs.title, url: absolute(locale, "/tashkilotlar") }])} />
      <div className="max-w-2xl">
        <h1 className="text-title-h3 sm:text-title-h2">{m.orgs.title}</h1>
        <p className="mt-3 text-paragraph-lg text-sub-600">{m.orgs.lead}</p>
      </div>

      <nav aria-label={m.orgs.typeAll} className="no-scrollbar mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          <li>
            <Link href={base} className={cn("inline-flex h-10 items-center rounded-full border px-4 text-label-sm font-medium focus-ring", !type ? "border-strong-950 bg-strong-950 text-white-0" : "border-soft-200 bg-white-0 text-strong-950 hover:bg-weak-50")} aria-current={!type ? "page" : undefined}>
              {m.orgs.typeAll} <span className="tabular ml-1.5 opacity-70">{all.length}</span>
            </Link>
          </li>
          {TYPES.filter((t) => typeCounts[t] > 0).map((t) => (
            <li key={t}>
              <Link href={`${base}?tur=${t}`} className={cn("inline-flex h-10 items-center rounded-full border px-4 text-label-sm font-medium focus-ring", type === t ? "border-strong-950 bg-strong-950 text-white-0" : "border-soft-200 bg-white-0 text-strong-950 hover:bg-weak-50")} aria-current={type === t ? "page" : undefined}>
                {orgTypeLabels[locale][t]} <span className="tabular ml-1.5 opacity-70">{typeCounts[t]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-6 grid gap-x-8 border-t border-strong-950 sm:grid-cols-2">
        {list.map(({ organization: o, count }) => {
          const sector = getSectorById(o.sectorId);
          const mahalla = o.mahallaId ? getMahalla(o.mahallaId) : undefined;
          return (
            <li key={o.id} className="border-b border-soft-200">
              <Link href={`${base}/${o.slug}`} className="flex items-center gap-4 py-4 transition-colors duration-150 hover:bg-qum-50 focus-ring rounded-8 sm:py-5">
                <Avatar name={o.name.uz} alt="" size="medium" shape="square" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label-md font-semibold text-strong-950">{o.name[locale]}</span>
                  <span className="mt-0.5 block truncate text-label-sm text-sub-600">
                    {orgTypeLabels[locale][o.type]}
                    {mahalla ? `, ${mahalla.name[locale]}` : ""}
                    {!mahalla && sector ? `, ${sector.shortName[locale].toLowerCase()}` : ""}
                  </span>
                </span>
                <span className={cn("font-display tabular shrink-0 text-label-lg font-bold", count ? "text-strong-950" : "text-soft-400")}>{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
