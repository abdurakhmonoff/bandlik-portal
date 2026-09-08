import Link from "next/link";
import { headers } from "next/headers";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { getSectors, countBySector } from "@/lib/vacancies";
import { HillIllustration } from "@/components/site/hill";
import { SearchForm } from "@/components/vacancy/search-form";
import { SectorIcon } from "@/components/site/sector-icon";

async function detectLocale(): Promise<Locale> {
  // not-found has no params; read the locale from the requested URL
  const h = await headers();
  const url = h.get("x-invoke-path") ?? h.get("next-url") ?? h.get("referer") ?? "";
  return /(^|\/)ru(\/|$|\?)/.test(url) ? "ru" : "uz";
}

export default async function NotFound() {
  const locale = await detectLocale();
  const m = getMessages(locale);
  const counts = countBySector();
  const sectors = getSectors()
    .filter((s) => counts[s.id] > 0)
    .slice(0, 6);
  return (
    <div className="site-container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <HillIllustration className="mb-8" />
        <h1 className="text-title-h3 sm:text-title-h2">{m.notFound.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-paragraph-lg text-sub-600">{m.notFound.lead}</p>
        <div className="mt-8">
          <SearchForm locale={locale} compact />
        </div>
      </div>
      <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="nf-sectors">
        <h2 id="nf-sectors" className="text-label-sm font-semibold text-sub-600">
          {m.notFound.popular}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {sectors.map((s) => (
            <li key={s.id}>
              <Link
                href={localePath(locale, `/sohalar/${s.slug}`)}
                className="inline-flex h-10 items-center gap-2 rounded-8 border border-soft-200 bg-white-0 px-3 text-label-sm font-medium text-strong-950 transition-colors duration-150 hover:border-sub-300 hover:bg-weak-50 focus-ring"
              >
                <SectorIcon icon={s.icon} size={20} className="text-primary-base" />
                {s.shortName[locale]}
                <span className="tabular text-sub-600">{counts[s.id]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
