import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, CalendarBlank, Users, Clock, GraduationCap, Briefcase, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { isLocale, localePath, locales } from "@/lib/i18n/config";
import { getMessages, employmentLabels, workModeLabels, experienceLabels, educationLabels, languageLabels, scheduleLabels, benefitLabels, socialLabels, forWhomLabels } from "@/lib/i18n/messages";
import { getAll, getBySlug, getOrganizationById, getMahalla, getSectorById, getSimilar, getByOrganization } from "@/lib/vacancies";
import { formatDate, formatRelative } from "@/lib/format";
import { Salary } from "@/components/vacancy/salary";
import { SaveButton } from "@/components/vacancy/save-button";
import { ContactReveal } from "@/components/vacancy/contact-reveal";
import { ShareButton } from "@/components/vacancy/share-button";
import { VacancyRow } from "@/components/vacancy/vacancy-row";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/rare/scroll-progress";
import { JsonLd, jobPosting, breadcrumbList, absolute } from "@/components/site/json-ld";
import { MapSnippet } from "@/components/site/map-snippet";

const NOW = new Date("2026-09-08T12:00:00Z");
type Params = Promise<{ locale: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getAll().map((v) => ({ locale, slug: v.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const v = getBySlug(slug);
  if (!v) return {};
  const m = getMessages(locale);
  const org = getOrganizationById(v.organizationId);
  const mahalla = v.mahallaId ? getMahalla(v.mahallaId) : undefined;
  const title = m.detail.metaTitle(v.title[locale], org?.name[locale] ?? "");
  const description = `${v.title[locale]} — ${mahalla ? mahalla.name[locale] + ", " : ""}${locale === "ru" ? "Кызылтепа" : "Qiziltepa"}. ${v.requirements.map((r) => r[locale]).slice(0, 2).join(". ")}.`;
  return {
    title,
    description,
    alternates: { canonical: localePath(locale, `/vakansiyalar/${slug}`), languages: { uz: `/vakansiyalar/${slug}`, ru: `/ru/vakansiyalar/${slug}` } },
    openGraph: { title, description, type: "article", publishedTime: v.publishedAt },
  };
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
      <div className="min-w-0">
        <dt className="text-label-xs text-sub-600">{label}</dt>
        <dd className="text-label-sm font-medium text-strong-950">{value}</dd>
      </div>
    </div>
  );
}

export default async function VacancyPage({ params }: { params: Params }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const v = getBySlug(slug);
  if (!v) notFound();
  const m = getMessages(locale);
  const org = getOrganizationById(v.organizationId);
  const mahalla = v.mahallaId ? getMahalla(v.mahallaId) : undefined;
  const sector = getSectorById(v.sectorId);
  const similar = getSimilar(v, 4);
  const orgRoles = org ? getByOrganization(org.id).length : 0;
  const path = `/vakansiyalar/${v.slug}`;
  const isNew = (NOW.getTime() - new Date(v.publishedAt).getTime()) / 86_400_000 <= 3;

  return (
    <article className="pb-24" style={{ viewTransitionName: `vacancy-${v.id}` }}>
      <ScrollProgress label={locale === "ru" ? "Прочитано" : "Oʻqilgan qismi"} />
      <JsonLd data={jobPosting(v, org, locale)} />
      <JsonLd
        data={breadcrumbList([
          { name: m.nav.home, url: absolute(locale, "/") },
          { name: m.list.title, url: absolute(locale, "/vakansiyalar") },
          { name: v.title[locale], url: absolute(locale, path) },
        ])}
      />

      {/* summary header — sticky */}
      <header className="sticky top-[var(--header-h)] z-20 border-b border-soft-200 bg-white-0/95 backdrop-blur">
        <div className="site-container flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-label-md font-semibold text-strong-950">{v.title[locale]}</p>
            <p className="truncate text-label-xs text-sub-600">
              {org?.name[locale]}
              {mahalla && <span className="ml-2">{mahalla.name[locale]}</span>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Salary vacancy={v} locale={locale} size="sm" compact className="hidden sm:flex" />
            <a href="#aloqa" className="inline-flex h-10 items-center rounded-8 bg-primary-base px-3.5 text-label-sm font-semibold text-white-0 transition-colors duration-150 hover:bg-primary-dark focus-ring">
              {m.detail.stickyApply}
            </a>
          </div>
        </div>
      </header>

      <div className="site-container pt-6">
        <Breadcrumb
          ariaLabel={m.common.breadcrumbs}
          items={[
            { label: m.nav.home, href: localePath(locale, "/") },
            { label: m.list.title, href: localePath(locale, "/vakansiyalar") },
            { label: sector.shortName[locale], href: localePath(locale, `/sohalar/${sector.slug}`) },
            { label: v.title[locale] },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* main column */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              {v.isFeatured && (
                <Badge variant="light" color="gold" icon={<Star size={12} aria-hidden="true" />}>
                  {m.card.featured}
                </Badge>
              )}
              {isNew && (
                <Badge variant="light" color="success" dot>
                  {m.common.new}
                </Badge>
              )}
              {v.socialCategories.length > 0 && (
                <Badge variant="light" color="information">
                  {m.detail.reserved}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-title-h3 sm:text-title-h2">{v.title[locale]}</h1>
            {org && (
              <p className="mt-3 text-paragraph-lg text-sub-600">
                <Link href={localePath(locale, `/tashkilotlar/${org.slug}`)} className="text-strong-950 underline-offset-4 hover:underline focus-ring rounded-4">
                  {org.name[locale]}
                </Link>
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-y border-soft-200 py-5">
              <Salary vacancy={v} locale={locale} size="lg" align="left" />
              <div className="flex items-center gap-2">
                <SaveButton id={v.id} title={v.title[locale]} />
                <ShareButton locale={locale} title={v.title[locale]} url={localePath(locale, path)} />
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Fact icon={MapPin} label={m.detail.location} value={mahalla ? mahalla.name[locale] : m.card.noMahalla} />
              <Fact icon={Briefcase} label={m.detail.facts.employment} value={`${employmentLabels[locale][v.employmentType]}, ${workModeLabels[locale][v.workMode].toLowerCase()}`} />
              <Fact icon={Users} label={m.detail.facts.openings} value={String(v.openings)} />
              <Fact icon={GraduationCap} label={m.detail.facts.experience} value={`${experienceLabels[locale][v.experience]}, ${educationLabels[locale][v.educationLevel].toLowerCase()}`} />
              {(v.schedule || v.workingHours) && (
                <Fact
                  icon={Clock}
                  label={m.detail.facts.schedule}
                  value={[v.schedule ? scheduleLabels[locale][v.schedule] : null, v.workingHours ? `${v.workingHours.from}–${v.workingHours.to}` : null].filter(Boolean).join(", ")}
                />
              )}
              <Fact icon={CalendarBlank} label={m.detail.facts.published} value={`${formatDate(v.publishedAt, locale)} (${formatRelative(v.publishedAt, locale, NOW)})`} />
            </dl>

            <section className="mt-10" aria-labelledby="about">
              <h2 id="about" className="text-title-h5">
                {m.detail.about}
              </h2>
              {v.description ? (
                <div className="prose-width mt-3 whitespace-pre-line text-paragraph-md text-strong-950">{v.description[locale]}</div>
              ) : (
                <p className="prose-width mt-3 text-paragraph-md text-sub-600">{m.detail.noDescription}</p>
              )}
            </section>

            <section className="mt-10" aria-labelledby="req">
              <h2 id="req" className="text-title-h5">
                {m.detail.requirements}
              </h2>
              <ul className="prose-width mt-3 space-y-2">
                {v.requirements.map((r, i) => (
                  <li key={i} className="flex gap-3 text-paragraph-md text-strong-950">
                    <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-primary-base" />
                    {r[locale]}
                  </li>
                ))}
                {(v.forWhom.length > 0 || v.socialCategories.length > 0) && (
                  <li className="pt-2">
                    <p className="text-label-sm font-semibold text-strong-950">{m.detail.forWhomTitle}</p>
                    <ul className="mt-1.5 flex flex-wrap gap-2">
                      {v.forWhom.map((k) => (
                        <li key={k}>
                          <Badge variant="lighter" color="information">
                            {forWhomLabels[locale][k]}
                          </Badge>
                        </li>
                      ))}
                      {v.socialCategories.map((k) => (
                        <li key={k}>
                          <Badge variant="lighter" color="information">
                            {socialLabels[locale][k]}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                {v.languages.length > 0 && (
                  <li className="flex gap-3 text-paragraph-md text-strong-950">
                    <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-primary-base" />
                    {m.detail.facts.languages}: {v.languages.map((l) => languageLabels[locale][l.code]).join(", ")}
                  </li>
                )}
              </ul>
            </section>

            <section className="mt-10" aria-labelledby="cond">
              <h2 id="cond" className="text-title-h5">
                {m.detail.conditions}
              </h2>
              <ul className="prose-width mt-3 space-y-2">
                {v.conditions.map((c, i) => (
                  <li key={i} className="flex gap-3 text-paragraph-md text-strong-950">
                    <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-strong-950" />
                    {c[locale]}
                  </li>
                ))}
              </ul>
              {v.benefits.length > 0 && (
                <>
                  <h3 className="mt-6 text-label-md font-semibold text-strong-950">{m.detail.benefits}</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {v.benefits.map((b) => (
                      <li key={b}>
                        <Badge variant="lighter" color="success">
                          {benefitLabels[locale][b]}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* contact — the point of the whole page */}
            <section className="mt-12 rounded-16 bg-sand-base p-5 sm:p-6" aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="text-title-h5">
                {m.detail.contactShown}
              </h2>
              <p className="mt-1.5 text-paragraph-sm text-sub-600">{m.detail.sourceNote}</p>
              <ContactReveal locale={locale} phone={v.phone} telegram={v.telegram} contactPerson={v.contactPerson} className="mt-5" />
            </section>

            <p className="mt-6 text-label-xs text-soft-400">
              <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-sub-600 focus-ring rounded-4">
                {m.detail.sourceLink}: Oson Ish #{v.sourceId}
                <ArrowSquareOut size={12} aria-hidden="true" />
              </a>
            </p>
          </div>

          {/* side column */}
          <aside className="space-y-6 lg:col-span-4">
            {org && (
              <section className="rounded-16 border border-soft-200 p-5" aria-labelledby="employer">
                <h2 id="employer" className="text-label-xs text-sub-600">
                  {m.detail.employer}
                </h2>
                <div className="mt-3 flex items-start gap-3">
                  <Avatar name={org.name.uz} alt="" size="medium" shape="square" />
                  <div className="min-w-0">
                    <p className="text-label-md font-semibold text-strong-950">{org.name[locale]}</p>
                    <p className="mt-0.5 text-label-xs text-sub-600">{org.legalForm ? `${org.legalForm}, ` : ""}{sector.shortName[locale]}</p>
                  </div>
                </div>
                {org.address && <p className="mt-3 text-paragraph-sm text-sub-600">{org.address}</p>}
                <Link href={localePath(locale, `/tashkilotlar/${org.slug}`)} className="mt-4 inline-flex h-10 items-center rounded-8 border border-soft-200 px-3.5 text-label-sm font-medium text-strong-950 hover:bg-weak-50 focus-ring">
                  {m.detail.employerRoles(orgRoles)}
                </Link>
              </section>
            )}
            <MapSnippet locale={locale} mahalla={mahalla?.name[locale] ?? null} address={v.address} coords={v.coords} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16" aria-labelledby="similar">
            <h2 id="similar" className="text-title-h4">
              {m.detail.similar}
            </h2>
            <div className="mt-4 border-t border-strong-950">
              {similar.map((s) => (
                <VacancyRow key={s.id} vacancy={s} locale={locale} now={NOW} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
