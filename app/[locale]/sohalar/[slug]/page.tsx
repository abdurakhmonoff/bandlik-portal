import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/types";
import { isLocale, localePath, locales } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getSectors, getSector, getBySector, countBySector, getOrganizationsWithCounts } from "@/lib/vacancies";
import { VacancyRow } from "@/components/vacancy/vacancy-row";
import { SectorsNav } from "@/components/home/sectors-nav";
import { SectorIcon } from "@/components/site/sector-icon";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { HillIllustration, HillEdge } from "@/components/site/hill";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";

const NOW = new Date("2026-09-08T12:00:00Z");
const PREVIEW = 12;
type Params = Promise<{ locale: string; slug: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => getSectors().map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const s = getSector(slug);
  if (!s) return {};
  const m = getMessages(locale);
  return {
    title: m.sectors.metaTitle(s.name[locale]),
    description: s.description[locale],
    alternates: { canonical: localePath(locale, `/sohalar/${slug}`), languages: { uz: `/sohalar/${slug}`, ru: `/ru/sohalar/${slug}` } },
  };
}

export default async function SectorPage({ params }: { params: Params }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const s = getSector(slug);
  if (!s) notFound();
  const m = getMessages(locale);
  const all = getBySector(s.id);
  const counts = countBySector();
  const sectors = getSectors();
  const employers = getOrganizationsWithCounts()
    .filter((o) => o.organization.sectorId === s.id && o.count > 0)
    .slice(0, 6);
  const listHref = localePath(locale, `/vakansiyalar?soha=${s.id}`);

  return (
    <div className="pb-16">
      <JsonLd data={breadcrumbList([{ name: m.nav.home, url: absolute(locale, "/") }, { name: m.sectors.title, url: absolute(locale, "/vakansiyalar") }, { name: s.name[locale], url: absolute(locale, `/sohalar/${s.slug}`) }])} />
      <section className="relative bg-sand-light">
        <div className="site-container pb-16 pt-6">
          <Breadcrumb ariaLabel={m.common.breadcrumbs} items={[{ label: m.nav.home, href: localePath(locale, "/") }, { label: m.list.title, href: localePath(locale, "/vakansiyalar") }, { label: s.name[locale] }]} />
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-16 bg-white-0 text-primary-base ring-1 ring-sand-stroke">
              <SectorIcon icon={s.icon} size={40} weight="duotone" />
            </span>
            <div className="max-w-2xl">
              <h1 className="text-title-h3 sm:text-title-h2">{s.name[locale]}</h1>
              <p className="tabular mt-2 text-label-md font-semibold text-primary-base">{m.sectors.lead(all.length)}</p>
              <p className="mt-3 text-paragraph-lg text-sub-600">{s.description[locale]}</p>
            </div>
          </div>
        </div>
        <HillEdge fill="white" height={56} className="-mb-px" />
      </section>

      <div className="site-container">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <SectorsNav sectors={sectors} counts={counts} locale={locale} activeId={s.id} />
        </div>

        {all.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md text-center">
            <HillIllustration className="mb-6 max-w-[14rem]" />
            <p className="text-paragraph-md text-sub-600">{m.sectors.empty}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <section className="lg:col-span-8" aria-labelledby="sector-roles">
              <div className="flex items-end justify-between gap-4">
                <h2 id="sector-roles" className="text-title-h5">
                  {m.list.title}
                </h2>
                {all.length > PREVIEW && (
                  <Link href={listHref} className="inline-flex h-9 items-center rounded-8 border border-soft-200 px-3 text-label-sm font-medium text-strong-950 hover:bg-weak-50 focus-ring">
                    {m.sectors.allInSector} ({all.length})
                  </Link>
                )}
              </div>
              <div className="mt-4 border-t border-strong-950">
                {all.slice(0, PREVIEW).map((v) => (
                  <VacancyRow key={v.id} vacancy={v} locale={locale} now={NOW} />
                ))}
              </div>
            </section>
            {employers.length > 0 && (
              <aside className="lg:col-span-4" aria-labelledby="sector-employers">
                <h2 id="sector-employers" className="text-title-h6">
                  {m.home.employers}
                </h2>
                <ul className="mt-3 border-t border-soft-200">
                  {employers.map(({ organization: o, count }) => (
                    <li key={o.id} className="border-b border-soft-200">
                      <Link href={localePath(locale, `/tashkilotlar/${o.slug}`)} className="flex items-center gap-3 py-3 hover:bg-qum-50 focus-ring rounded-8">
                        <Avatar name={o.name.uz} alt="" size="small" shape="square" />
                        <span className="min-w-0 flex-1 truncate text-label-sm font-medium text-strong-950">{o.name[locale]}</span>
                        <span className="tabular text-label-sm text-sub-600">{count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
