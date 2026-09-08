import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getMahallas, countByMahalla, getStats } from "@/lib/vacancies";
import { DistrictReveal } from "@/components/district/district-reveal";
import { HillEdge } from "@/components/site/hill";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";
import { cn } from "@/lib/utils";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    title: m.district.title,
    description: m.district.metaDescription,
    alternates: { canonical: localePath(locale, "/tuman"), languages: { uz: "/tuman", ru: "/ru/tuman" } },
  };
}

export default async function DistrictPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  const d = m.district;
  const mahallas = getMahallas();
  const counts = countByMahalla();
  const stats = getStats();
  const facts = [
    { label: d.facts.population, value: d.facts.populationValue },
    { label: d.facts.area, value: d.facts.areaValue },
    { label: d.facts.mahallas, value: String(mahallas.length) },
    { label: d.facts.center, value: d.facts.centerValue },
    { label: d.facts.region, value: d.facts.regionValue },
  ];

  return (
    <div className="pb-16">
      <JsonLd data={breadcrumbList([{ name: m.nav.home, url: absolute(locale, "/") }, { name: d.title, url: absolute(locale, "/tuman") }])} />

      {/* hero — the brand gets to breathe */}
      <section className="relative overflow-hidden bg-white-0">
        <div className="site-container relative z-10 pb-20 pt-14 sm:pb-28 sm:pt-20">
          <p className="text-label-sm font-medium text-primary-base">{locale === "ru" ? "О районе" : "Tuman haqida"}</p>
          <h1 className="font-display display-condensed mt-3 max-w-4xl text-[2.5rem] font-bold leading-[1.02] tracking-[-0.025em] sm:text-title-h1 lg:text-[4.5rem]">
            {d.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-paragraph-lg text-sub-600 sm:text-paragraph-xl">{d.heroLead}</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
          <HillEdge fill="primary" height={160} className="opacity-10" />
          <HillEdge fill="sand" height={100} className="absolute inset-x-0 bottom-0" />
        </div>
      </section>

      {/* facts on the sand */}
      <section className="bg-sand-base" aria-label={locale === "ru" ? "Факты о районе" : "Tuman haqida faktlar"}>
        <div className="site-container pb-12 pt-2 sm:pb-16">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-5">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col-reverse gap-1 border-l-2 border-primary-base pl-4">
                <dt className="text-label-sm text-sub-600">{f.label}</dt>
                <dd className="font-display tabular text-[1.5rem] font-bold leading-none tracking-[-0.02em] text-strong-950 sm:text-[1.75rem]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* the one non-user-triggered reveal on this page */}
      <section className="site-container pt-16 sm:pt-20" aria-label={d.photoCaption}>
        <DistrictReveal src="/images/qiziltepa-landscape.jpg" alt={d.photoCaption} caption={`${d.photoCaption} — ${locale === "ru" ? "иллюстрация" : "illyustratsiya"}`} />
      </section>

      {/* economy */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="economy">
        <h2 id="economy" className="text-title-h4 sm:text-title-h3">
          {d.economyTitle}
        </h2>
        <ol className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {d.economy.map((e, i) => (
            <li key={e.title} className="flex gap-5">
              <span aria-hidden="true" className="font-display tabular shrink-0 text-title-h4 font-bold leading-none text-primary-base">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-title-h6">{e.title}</h3>
                <p className="prose-width mt-2 text-paragraph-md text-sub-600">{e.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* mahallas */}
      <section className="mt-20 bg-sand-light sm:mt-24" aria-labelledby="mahallas">
        <HillEdge fill="white" height={56} className="-mb-px rotate-180" />
        <div className="site-container pb-16 pt-4 sm:pb-20">
          <h2 id="mahallas" className="text-title-h4 sm:text-title-h3">
            {d.mahallasTitle} <span className="tabular text-sub-600">{mahallas.length}</span>
          </h2>
          <p className="mt-2 max-w-2xl text-paragraph-md text-sub-600">{d.mahallasLead}</p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
            {mahallas.map((x) => {
              const n = counts[x.id] ?? 0;
              return (
                <li key={x.id} className="border-b border-sand-stroke">
                  {n > 0 ? (
                    <Link href={localePath(locale, `/vakansiyalar?mahalla=${x.id}`)} className="flex items-center justify-between gap-2 py-2.5 text-label-sm font-medium text-strong-950 hover:text-primary-base focus-ring rounded-4">
                      <span className="truncate">{x.name[locale]}</span>
                      <span className="tabular shrink-0 text-sub-600">{n}</span>
                    </Link>
                  ) : (
                    <span className={cn("flex items-center justify-between gap-2 py-2.5 text-label-sm text-sub-600")}>
                      <span className="truncate">{x.name[locale]}</span>
                      <span className="tabular shrink-0 text-soft-400">0</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* why */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="why">
        <h2 id="why" className="text-title-h4 sm:text-title-h3">
          {d.whyTitle}
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {d.why.map((w) => (
            <li key={w.title} className="rounded-16 border border-soft-200 p-5">
              <h3 className="text-title-h6">{w.title}</h3>
              <p className="mt-2 text-paragraph-md text-sub-600">{w.text}</p>
            </li>
          ))}
        </ul>
        <Link href={localePath(locale, "/vakansiyalar")} className="mt-10 inline-flex h-12 items-center rounded-10 bg-primary-base px-5 text-label-md font-semibold text-white-0 hover:bg-primary-dark focus-ring">
          {d.cta} ({stats.openVacancies})
        </Link>
      </section>
    </div>
  );
}
