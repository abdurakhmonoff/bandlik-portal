import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { filter as runFilter, parseFilter, filterToParams, getFacets, getSectors, getMahallas, getOrganizations, activeFilterCount } from "@/lib/vacancies";
import { VacancyRow } from "@/components/vacancy/vacancy-row";
import { FilterRail } from "@/components/vacancy/filter-rail";
import { ListToolbar } from "@/components/vacancy/list-toolbar";
import { SearchForm } from "@/components/vacancy/search-form";
import { HillIllustration } from "@/components/site/hill";
import { Pagination } from "@/components/ui/pagination";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";

const NOW = new Date("2026-09-08T12:00:00Z");

type Params = Promise<{ locale: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  const f = parseFilter(await searchParams);
  const filtered = activeFilterCount(f) > 0 || !!f.q;
  return {
    title: m.list.metaTitle,
    description: m.list.metaDescription,
    alternates: { canonical: localePath(locale, "/vakansiyalar"), languages: { uz: "/vakansiyalar", ru: "/ru/vakansiyalar" } },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function VacanciesPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  const f = parseFilter(await searchParams);
  const result = runFilter(f);
  const facets = getFacets();
  const sectors = getSectors();
  const mahallas = getMahallas();
  const names = {
    sectors: Object.fromEntries(sectors.map((s) => [s.id, s.shortName[locale]])),
    mahallas: Object.fromEntries(mahallas.map((x) => [x.id, x.name[locale]])),
    organizations: Object.fromEntries(getOrganizations().map((o) => [o.id, o.name[locale]])),
  };
  const base = localePath(locale, "/vakansiyalar");
  const hrefFor = (page: number) => {
    const p = filterToParams({ ...f, page });
    const qs = p.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const isEmpty = result.total === 0;

  return (
    <div className="site-container pb-16 pt-8 sm:pt-10">
      <JsonLd
        data={breadcrumbList([
          { name: m.nav.home, url: absolute(locale, "/") },
          { name: m.list.title, url: absolute(locale, "/vakansiyalar") },
        ])}
      />
      <div className="max-w-3xl">
        <h1 className="text-title-h3 sm:text-title-h2">{m.list.title}</h1>
        <div className="mt-5">
          <SearchForm locale={locale} compact defaultQuery={f.q ?? ""} defaultMahalla={f.mahalla?.[0] ?? ""} id="list-search" />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <FilterRail locale={locale} filter={f} facets={facets} sectors={sectors} mahallas={mahallas} total={result.total} />

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            {m.list.title}
          </h2>
          <ListToolbar locale={locale} filter={f} total={result.total} names={names}>
            {/* the mobile filter trigger renders inside the rail component on small screens */}
          </ListToolbar>

          {isEmpty ? (
            <div className="mx-auto max-w-md py-14 text-center">
              <HillIllustration className="mb-6 max-w-[14rem]" />
              <h3 className="text-title-h5">{f.q ? m.list.emptySearchTitle(f.q) : m.list.emptyTitle}</h3>
              <p className="mt-2 text-paragraph-md text-sub-600">{f.q ? m.list.emptySearchLead : m.list.emptyLead}</p>
              <Link href={base} className="mt-6 inline-flex h-10 items-center rounded-8 bg-strong-950 px-4 text-label-sm font-medium text-white-0 hover:bg-surface-800 focus-ring">
                {m.list.resetFilters}
              </Link>
            </div>
          ) : (
            <>
              <div className="border-t border-strong-950">
                {result.items.map((v) => (
                  <VacancyRow key={v.id} vacancy={v} locale={locale} now={NOW} />
                ))}
              </div>
              {result.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    page={result.page}
                    totalPages={result.totalPages}
                    hrefFor={hrefFor}
                    labels={{ previous: m.common.previous, next: m.common.next, page: m.common.page, of: m.common.of }}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
