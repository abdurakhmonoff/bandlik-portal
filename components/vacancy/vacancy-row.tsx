import Link from "next/link";
import { MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import type { Locale, Vacancy } from "@/types";
import { getMessages, employmentLabels } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { getMahalla, getOrganizationById } from "@/lib/vacancies";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Salary } from "@/components/vacancy/salary";
import { SaveButton } from "@/components/vacancy/save-button";

const NEW_DAYS = 3;

/**
 * A vacancy as a ledger row: full width, hairline-separated, salary in a
 * tabular right column. On phones the row stacks into a card, but the
 * salary and mahalla are still above the fold of the row itself.
 */
export function VacancyRow({
  vacancy,
  locale,
  now,
  className,
  compact = false,
}: {
  vacancy: Vacancy;
  locale: Locale;
  now?: Date;
  className?: string;
  compact?: boolean;
}) {
  const m = getMessages(locale);
  const org = getOrganizationById(vacancy.organizationId);
  const mahalla = vacancy.mahallaId ? getMahalla(vacancy.mahallaId) : undefined;
  const href = localePath(locale, `/vakansiyalar/${vacancy.slug}`);
  const ageDays = now ? Math.floor((now.getTime() - new Date(vacancy.publishedAt).getTime()) / 86_400_000) : 99;
  const isNew = ageDays <= NEW_DAYS;

  return (
    <article
      className={cn(
        "group relative flex gap-3 border-b border-soft-200 py-4 transition-colors duration-150 hover:bg-qum-50 sm:gap-6 sm:py-5",
        className,
      )}
      style={{ viewTransitionName: `vacancy-${vacancy.id}` }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {vacancy.isFeatured && (
            <span
              className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-4 bg-oltin-100 text-oltin-800"
              title={m.card.featured}
            >
              <Star size={14} aria-hidden="true" />
              <span className="sr-only">{m.card.featured}</span>
            </span>
          )}
          <h3 className="min-w-0 font-sans text-label-md font-semibold leading-6 text-strong-950">
            <Link
              href={href}
              className="focus-ring rounded-4 after:absolute after:inset-0 after:content-['']"
            >
              {vacancy.title[locale]}
            </Link>
          </h3>
        </div>
        {org && <p className="mt-1 truncate text-paragraph-sm text-sub-600">{org.name[locale]}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label-sm text-sub-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={16} aria-hidden="true" className="text-soft-400" />
            {mahalla ? mahalla.name[locale] : m.card.noMahalla}
          </span>
          <span>{employmentLabels[locale][vacancy.employmentType]}</span>
          {!compact && vacancy.openings > 1 && <span>{m.card.openings(vacancy.openings)}</span>}
          <span className="inline-flex items-center gap-1.5">
            {isNew && (
              <span className="inline-flex items-center gap-1 text-success-base">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-success-base" />
                {m.common.new}
              </span>
            )}
            {now && <time dateTime={vacancy.publishedAt}>{formatRelative(vacancy.publishedAt, locale, now)}</time>}
          </span>
        </div>

        {/* mobile: salary sits inside the text block so it is visible before the row scrolls */}
        <Salary vacancy={vacancy} locale={locale} align="left" size="sm" className="mt-3 sm:hidden" />
      </div>

      <div className="hidden shrink-0 flex-col items-end justify-between sm:flex">
        <Salary vacancy={vacancy} locale={locale} />
      </div>

      <div className="relative z-10 shrink-0 self-start">
        <SaveButton id={vacancy.id} title={vacancy.title[locale]} size="small" />
      </div>
    </article>
  );
}

/** Small card used inside the assistant and in "similar" lists. */
export function VacancyMiniCard({ vacancy, locale, className }: { vacancy: Vacancy; locale: Locale; className?: string }) {
  const org = getOrganizationById(vacancy.organizationId);
  const mahalla = vacancy.mahallaId ? getMahalla(vacancy.mahallaId) : undefined;
  const m = getMessages(locale);
  return (
    <Link
      href={localePath(locale, `/vakansiyalar/${vacancy.slug}`)}
      className={cn(
        "block rounded-12 border border-soft-200 bg-white-0 p-3.5 transition-colors duration-150 hover:border-sub-300 hover:bg-qum-50 focus-ring",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm font-semibold text-strong-950">{vacancy.title[locale]}</p>
          {org && <p className="mt-0.5 truncate text-label-xs text-sub-600">{org.name[locale]}</p>}
          <p className="mt-1.5 inline-flex items-center gap-1 text-label-xs text-sub-600">
            <MapPin size={14} aria-hidden="true" className="text-soft-400" />
            {mahalla ? mahalla.name[locale] : m.card.noMahalla}
          </p>
        </div>
        <Salary vacancy={vacancy} locale={locale} size="sm" compact />
      </div>
    </Link>
  );
}
