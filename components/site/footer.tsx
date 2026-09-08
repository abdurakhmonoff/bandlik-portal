import Link from "next/link";
import { PaperPlaneTilt, Phone, MapPin, Clock } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { hokimlik, bandlikMarkazi, dataSource, portalTelegram } from "@/data/organization";
import { getSectors } from "@/lib/vacancies";
import { Logo } from "@/components/site/logo";
import { HillEdge } from "@/components/site/hill";
import { telHref } from "@/lib/format";

export function Footer({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const sectors = getSectors().slice(0, 6);
  const portalLinks = [
    { href: "/vakansiyalar", label: m.nav.vacancies },
    { href: "/tashkilotlar", label: m.nav.organizations },
    { href: "/saqlangan", label: m.nav.saved },
    { href: "/yordam", label: m.nav.help },
    { href: "/aloqa", label: m.nav.contact },
  ];
  return (
    <footer className="relative mt-24 bg-strong-950 text-tepa-200 print-hidden">
      {/* the ground line: hill inverted into the ink field */}
      <div className="absolute inset-x-0 -top-px overflow-hidden" aria-hidden="true">
        <HillEdge fill="white" height={72} className="rotate-180" />
      </div>
      <div className="site-container relative pt-28 pb-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo locale={locale} tone="dark" withDistrict />
            <p className="mt-5 max-w-sm text-paragraph-sm text-tepa-300">{m.footer.about}</p>
            <a
              href={portalTelegram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-8 border border-tepa-700 px-3.5 text-label-sm font-medium text-white-0 transition-colors duration-150 hover:border-tepa-500 hover:bg-tepa-800 focus-ring"
            >
              <PaperPlaneTilt size={20} aria-hidden="true" />
              {m.footer.telegram}
              {portalTelegram.sample && <span className="sr-only">({m.common.sampleData})</span>}
            </a>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-label-sm font-semibold text-white-0">{m.footer.sections.portal}</h2>
            <ul className="mt-4 space-y-2.5">
              {portalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={localePath(locale, l.href)} className="text-paragraph-sm text-tepa-300 hover:text-white-0 focus-ring rounded-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-label-sm font-semibold text-white-0">{m.nav.sectors}</h2>
            <ul className="mt-4 space-y-2.5">
              {sectors.map((s) => (
                <li key={s.id}>
                  <Link href={localePath(locale, `/sohalar/${s.slug}`)} className="text-paragraph-sm text-tepa-300 hover:text-white-0 focus-ring rounded-4">
                    {s.shortName[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-label-sm font-semibold text-white-0">{hokimlik.name[locale]}</h2>
            <ul className="mt-4 space-y-3 text-paragraph-sm text-tepa-300">
              <li className="flex gap-2.5">
                <MapPin size={20} className="mt-0.5 shrink-0 text-tepa-400" aria-hidden="true" />
                <span>{hokimlik.address[locale]}</span>
              </li>
              {hokimlik.phones.map((p) => (
                <li key={p.phone} className="flex gap-2.5">
                  <Phone size={20} className="mt-0.5 shrink-0 text-tepa-400" aria-hidden="true" />
                  <a href={telHref(p.phone)} className="tabular hover:text-white-0 focus-ring rounded-4">
                    {p.phone}
                  </a>
                </li>
              ))}
              <li className="flex gap-2.5">
                <Clock size={20} className="mt-0.5 shrink-0 text-tepa-400" aria-hidden="true" />
                <span>
                  {hokimlik.hours[0].days[locale]}, {hokimlik.hours[0].time}
                </span>
              </li>
              <li>
                <Link href={localePath(locale, "/aloqa")} className="text-white-0 underline-offset-4 hover:underline focus-ring rounded-4">
                  {bandlikMarkazi.shortName[locale]}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-tepa-800 pt-6 text-label-xs text-tepa-400 md:flex-row md:items-center md:justify-between">
          <p>{m.footer.legal}</p>
          <p>
            <a href={dataSource.url} target="_blank" rel="noopener noreferrer" className="hover:text-white-0 focus-ring rounded-4">
              {m.footer.source}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
