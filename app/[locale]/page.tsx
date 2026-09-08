import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import heroPhoto from "@/public/images/hero-office.jpg";
import { PaperPlaneTilt, Wheelchair, UsersThree, GraduationCap, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getStats, getRecent, getSectors, countBySector, getMajorEmployers, count } from "@/lib/vacancies";
import { portalTelegram } from "@/data/organization";
import { SearchForm } from "@/components/vacancy/search-form";
import { VacancyRow } from "@/components/vacancy/vacancy-row";
import { HeroEntrance } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats";
import { SectorsNav } from "@/components/home/sectors-nav";
import { HowToSteps } from "@/components/home/steps";
import { SectionHeading } from "@/components/site/section-heading";
import { SectorIcon } from "@/components/site/sector-icon";
import { HillEdge } from "@/components/site/hill";
import { Avatar } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const dynamic = "force-static";
const NOW = new Date("2026-09-08T12:00:00Z");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    title: { absolute: m.home.title },
    description: m.site.description,
    alternates: { canonical: localePath(locale, "/"), languages: { uz: "/", ru: "/ru" } },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  const stats = getStats(NOW);
  const recent = getRecent(7);
  const sectors = getSectors();
  const counts = countBySector();
  const employers = getMajorEmployers(8);
  const special = [
    { key: "disability", icon: Wheelchair, href: "/vakansiyalar?kimlar=disability", n: count({ forWhom: ["disability"] }) + count({ social: ["disability"] }) },
    { key: "youth", icon: UsersThree, href: "/vakansiyalar?yosh=25", n: count({ age: 25 }) },
    { key: "students", icon: GraduationCap, href: "/vakansiyalar?tajriba=none", n: count({ experience: ["none"] }) },
    { key: "reserved", icon: ShieldCheck, href: "/vakansiyalar?toifa=social-register,disability,orphans", n: count({ social: ["social-register", "disability", "orphans", "domestic-violence-survivors", "released-from-prison", "trafficking-survivors"] }) },
  ] as const;

  return (
    <>
      {/* 1. Hero — the search is the hero; a workplace photo under an ink gradient, the hill closing the section */}
      <section className="relative isolate overflow-hidden bg-strong-950 text-white-0" aria-labelledby="hero-title">
        <Image
          src={heroPhoto}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        {/* ink gradient: heavy on the left where the type sits, lighter on the right */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(27_36_48/0.94)_0%,rgb(27_36_48/0.82)_45%,rgb(27_36_48/0.55)_100%)]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[linear-gradient(to_bottom,transparent,rgb(27_36_48/0.6))]" />
        <div className="site-container relative z-10 pb-28 pt-14 sm:pb-36 sm:pt-20 lg:pt-24">
          <HeroEntrance
            title={
              <h1 id="hero-title" className="font-display display-condensed text-[2.5rem] font-bold leading-[1.02] tracking-[-0.025em] text-white-0 sm:text-title-h1 lg:text-[4.25rem]">
                {m.home.heroTitle}
              </h1>
            }
            lead={<p className="mt-4 max-w-xl text-paragraph-lg text-tepa-200 sm:text-paragraph-xl">{m.home.heroLead}</p>}
            search={<SearchForm locale={locale} onDark />}
            chips={
              <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-label-sm text-tepa-300">
                <span>{m.home.popular}:</span>
                {m.home.popularTerms.map((term) => (
                  <Link
                    key={term}
                    href={localePath(locale, `/vakansiyalar?q=${encodeURIComponent(term)}`)}
                    className="inline-flex h-8 items-center rounded-full border border-white-0/20 bg-white-0/10 px-3 text-white-0 backdrop-blur-sm transition-colors duration-150 hover:bg-white-0/20 focus-ring"
                  >
                    {term}
                  </Link>
                ))}
              </p>
            }
          />
        </div>
        {/* the hill: sand rising out of the ink, drawn once */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10" aria-hidden="true">
          <HillEdge fill="primary" height={150} className="opacity-60" />
          <HillEdge fill="sand" height={96} className="absolute inset-x-0 bottom-0" />
        </div>
      </section>

      {/* 2. Stats — on the sand, the ground line of the hill */}
      <section className="bg-sand-base" aria-label={locale === "ru" ? "Статистика района" : "Tuman statistikasi"}>
        <div className="site-container pb-12 pt-4 sm:pb-16">
          <StatsStrip stats={stats} locale={locale} />
        </div>
      </section>

      {/* 3. Recent vacancies — the ledger */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="recent">
        <SectionHeading
          id="recent"
          title={m.home.recent}
          lead={m.home.recentLead}
          action={{ href: localePath(locale, "/vakansiyalar"), label: m.common.showAll }}
        />
        <div className="mt-6 border-t border-strong-950">
          {recent.map((v) => (
            <VacancyRow key={v.id} vacancy={v} locale={locale} now={NOW} />
          ))}
        </div>
        <div className="mt-6 sm:hidden">
          <Link
            href={localePath(locale, "/vakansiyalar")}
            className="inline-flex h-11 w-full items-center justify-center rounded-8 border border-soft-200 text-label-md font-medium text-strong-950 hover:bg-weak-50 focus-ring"
          >
            {m.common.showAll}
          </Link>
        </div>
      </section>

      {/* 4. Sectors — ordered by the district economy */}
      <section className="mt-20 bg-sand-light sm:mt-24" aria-labelledby="sectors">
        <HillEdge fill="white" height={64} className="-mb-px rotate-180" />
        <div className="site-container pb-16 pt-6 sm:pb-20">
          <SectionHeading id="sectors" title={m.home.sectors} lead={m.home.sectorsLead} />
          <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <SectorsNav sectors={sectors} counts={counts} locale={locale} allLabel={m.common.all} allHref={localePath(locale, "/vakansiyalar")} />
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {sectors.map((s) => (
              <li key={s.id}>
                <Link
                  href={localePath(locale, `/sohalar/${s.slug}`)}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-12 bg-white-0 p-4 ring-1 ring-sand-stroke transition-[box-shadow] duration-150 hover:ring-sub-300 hover:shadow-regular-sm focus-ring sm:p-5"
                >
                  <SectorIcon icon={s.icon} size={32} weight="duotone" className="text-primary-base" />
                  <span className="mt-6 block">
                    <span className="block text-label-md font-semibold text-strong-950">{s.shortName[locale]}</span>
                    <span className="tabular mt-1 block text-label-sm text-sub-600">
                      {counts[s.id]} {m.common.vacancies}
                    </span>
                  </span>
                  {/* the baseline that rises on hover — the hill in one pixel */}
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-base transition-transform duration-200 ease-out group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Special categories */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="special">
        <SectionHeading id="special" title={m.home.special} lead={m.home.specialLead} />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {special.map((s) => {
            const Icon = s.icon;
            const item = m.home.specialItems[s.key];
            return (
              <li key={s.key}>
                <Link
                  href={localePath(locale, s.href)}
                  className="group flex items-center gap-4 rounded-12 border border-soft-200 p-4 transition-colors duration-150 hover:border-sub-300 hover:bg-qum-50 focus-ring sm:p-5"
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-10 bg-sand-base text-primary-base">
                    <Icon size={24} weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-label-md font-semibold text-strong-950">{item.title}</span>
                    <span className="mt-0.5 block text-paragraph-sm text-sub-600">{item.lead}</span>
                  </span>
                  <span className="font-display tabular shrink-0 text-label-lg font-bold text-strong-950">{s.n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 6. Major employers */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="employers">
        <SectionHeading
          id="employers"
          title={m.home.employers}
          lead={m.home.employersLead}
          action={{ href: localePath(locale, "/tashkilotlar"), label: m.common.showAll }}
        />
        <ul className="mt-6 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {employers.map(({ organization, count: n }) => (
            <li key={organization.id} className="border-b border-soft-200">
              <Link
                href={localePath(locale, `/tashkilotlar/${organization.slug}`)}
                className="flex items-center gap-3 py-4 transition-colors duration-150 hover:bg-qum-50 focus-ring rounded-8"
              >
                <Avatar name={organization.name.uz} alt="" size="medium" shape="square" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label-sm font-semibold text-strong-950">{organization.name[locale]}</span>
                  <span className="tabular block text-label-xs text-sub-600">{m.orgs.openRoles(n)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. How do I find a job? */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="howto">
        <SectionHeading id="howto" title={m.home.howTo} lead={m.home.howToLead} />
        <div className="mt-8">
          <HowToSteps locale={locale} />
        </div>
      </section>

      {/* 8. Telegram band — ink field with the hill as ground */}
      <section className="relative mt-20 overflow-hidden bg-strong-950 text-white-0 sm:mt-24" aria-labelledby="telegram">
        <div className="absolute inset-x-0 top-0" aria-hidden="true">
          <HillEdge fill="white" height={64} className="rotate-180" />
        </div>
        <div className="site-container relative flex flex-col gap-6 pb-14 pt-24 sm:flex-row sm:items-center sm:justify-between sm:pb-16 sm:pt-28">
          <div className="max-w-xl">
            <h2 id="telegram" className="text-title-h4 sm:text-title-h3">
              {m.home.telegramTitle}
            </h2>
            <p className="mt-3 text-paragraph-md text-tepa-300">{m.home.telegramLead}</p>
          </div>
          <a
            href={portalTelegram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-8 bg-white-0 px-5 text-label-md font-semibold text-strong-950 transition-colors duration-150 hover:bg-sand-base focus-ring"
          >
            <PaperPlaneTilt size={20} aria-hidden="true" />
            {m.home.telegramCta}
          </a>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="site-container pt-16 sm:pt-20" aria-labelledby="faq">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="faq" title={m.home.faq} />
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="border-t border-strong-950">
              {m.home.faqItems.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>
                    <p className="prose-width text-paragraph-md text-sub-600">{f.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
