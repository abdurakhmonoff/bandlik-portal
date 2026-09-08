import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Buildings, IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { isLocale, localePath, locales } from "@/lib/i18n/config";
import { getMessages, orgTypeLabels } from "@/lib/i18n/messages";
import { getOrganizations, getOrganization, getByOrganization, getSectorById, getMahalla } from "@/lib/vacancies";
import { VacancyRow } from "@/components/vacancy/vacancy-row";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";
import { HillIllustration } from "@/components/site/hill";

const NOW = new Date("2026-09-08T12:00:00Z");
type Params = Promise<{ locale: string; slug: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => getOrganizations().map((o) => ({ locale, slug: o.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const o = getOrganization(slug);
  if (!o) return {};
  const m = getMessages(locale);
  const n = getByOrganization(o.id).length;
  return {
    title: `${o.name[locale]} — ${m.orgs.openRoles(n)}`,
    description: `${o.name[locale]}: ${m.orgs.openRoles(n)}. ${locale === "ru" ? "Кызылтепинский район" : "Qiziltepa tumani"}.`,
    alternates: { canonical: localePath(locale, `/tashkilotlar/${slug}`), languages: { uz: `/tashkilotlar/${slug}`, ru: `/ru/tashkilotlar/${slug}` } },
  };
}

export default async function OrganizationPage({ params }: { params: Params }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const o = getOrganization(slug);
  if (!o) notFound();
  const m = getMessages(locale);
  const roles = getByOrganization(o.id);
  const sector = getSectorById(o.sectorId);
  const mahalla = o.mahallaId ? getMahalla(o.mahallaId) : undefined;

  return (
    <div className="site-container pb-16 pt-6">
      <JsonLd
        data={breadcrumbList([
          { name: m.nav.home, url: absolute(locale, "/") },
          { name: m.orgs.title, url: absolute(locale, "/tashkilotlar") },
          { name: o.name[locale], url: absolute(locale, `/tashkilotlar/${o.slug}`) },
        ])}
      />
      <Breadcrumb ariaLabel={m.common.breadcrumbs} items={[{ label: m.nav.home, href: localePath(locale, "/") }, { label: m.orgs.title, href: localePath(locale, "/tashkilotlar") }, { label: o.name[locale] }]} />

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={o.name.uz} alt="" size="large" shape="square" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title-h4 sm:text-title-h3">{o.name[locale]}</h1>
          <p className="mt-2 text-paragraph-md text-sub-600">
            {orgTypeLabels[locale][o.type]}
            {o.legalForm ? ` (${o.legalForm})` : ""}
          </p>
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-label-sm sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Buildings size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
              <div>
                <dt className="text-label-xs text-sub-600">{m.orgs.sector}</dt>
                <dd className="font-medium text-strong-950">{sector.name[locale]}</dd>
              </div>
            </div>
            {(mahalla || o.address) && (
              <div className="flex items-start gap-2.5">
                <MapPin size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
                <div>
                  <dt className="text-label-xs text-sub-600">{m.common.address}</dt>
                  <dd className="font-medium text-strong-950">{[mahalla?.name[locale], o.address].filter(Boolean).join(", ")}</dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5 sm:col-span-2">
              <IdentificationCard size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
              <div>
                <dt className="text-label-xs text-sub-600">{m.orgs.legalName}</dt>
                <dd className="font-medium text-strong-950">
                  {o.legalName}
                  {o.tin ? <span className="tabular ml-2 text-sub-600">{m.orgs.tin} {o.tin}</span> : null}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="roles">
        <h2 id="roles" className="text-title-h5">
          {m.orgs.roles} <span className="tabular text-sub-600">{roles.length}</span>
        </h2>
        {roles.length ? (
          <div className="mt-4 border-t border-strong-950">
            {roles.map((v) => (
              <VacancyRow key={v.id} vacancy={v} locale={locale} now={NOW} />
            ))}
          </div>
        ) : (
          <div className="mt-6 max-w-md text-center">
            <HillIllustration className="mb-4 max-w-[12rem]" />
            <p className="text-paragraph-md text-sub-600">{m.orgs.noRoles}</p>
          </div>
        )}
      </section>
    </div>
  );
}
