"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale, VacancyFilter, VacancySort } from "@/types";
import { getMessages, sortLabels, employmentLabels, workModeLabels, experienceLabels, educationLabels, languageLabels, scheduleLabels, socialLabels, forWhomLabels } from "@/lib/i18n/messages";
import { filterToParams, SORTS } from "@/lib/vacancies";
import { formatCompactSum } from "@/lib/format";
import { NativeSelect } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

type Chip = { key: string; label: string; next: VacancyFilter };

function chipsFor(f: VacancyFilter, locale: Locale, names: { sectors: Record<string, string>; mahallas: Record<string, string>; organizations: Record<string, string> }): Chip[] {
  const m = getMessages(locale).list;
  const out: Chip[] = [];
  const drop = <K extends keyof VacancyFilter>(key: K, value?: string): VacancyFilter => {
    const cur = f[key];
    if (Array.isArray(cur) && value != null) {
      const rest = (cur as string[]).filter((x) => x !== value);
      return { ...f, [key]: rest.length ? rest : undefined, page: undefined };
    }
    return { ...f, [key]: undefined, page: undefined };
  };
  f.mahalla?.forEach((id) => out.push({ key: `mahalla:${id}`, label: names.mahallas[id] ?? id, next: drop("mahalla", id) }));
  f.sector?.forEach((id) => out.push({ key: `sector:${id}`, label: names.sectors[id] ?? id, next: drop("sector", id) }));
  if (f.position) out.push({ key: "position", label: `${m.groups.position}: ${f.position}`, next: drop("position") });
  if (f.salaryMin != null) out.push({ key: "salaryMin", label: `${m.salaryFrom} ${formatCompactSum(f.salaryMin, locale)}`, next: drop("salaryMin") });
  if (f.salaryMax != null) out.push({ key: "salaryMax", label: `${m.salaryTo} ${formatCompactSum(f.salaryMax, locale)}`, next: drop("salaryMax") });
  f.employment?.forEach((k) => out.push({ key: `employment:${k}`, label: employmentLabels[locale][k], next: drop("employment", k) }));
  f.mode?.forEach((k) => out.push({ key: `mode:${k}`, label: workModeLabels[locale][k], next: drop("mode", k) }));
  f.experience?.forEach((k) => out.push({ key: `experience:${k}`, label: experienceLabels[locale][k], next: drop("experience", k) }));
  f.education?.forEach((k) => out.push({ key: `education:${k}`, label: educationLabels[locale][k], next: drop("education", k) }));
  f.language?.forEach((k) => out.push({ key: `language:${k}`, label: languageLabels[locale][k], next: drop("language", k) }));
  f.schedule?.forEach((k) => out.push({ key: `schedule:${k}`, label: scheduleLabels[locale][k], next: drop("schedule", k) }));
  f.social?.forEach((k) => out.push({ key: `social:${k}`, label: socialLabels[locale][k], next: drop("social", k) }));
  f.forWhom?.forEach((k) => out.push({ key: `forWhom:${k}`, label: forWhomLabels[locale][k], next: drop("forWhom", k) }));
  if (f.age != null) out.push({ key: "age", label: `${m.groups.age}: ${f.age}`, next: drop("age") });
  if (f.organization) out.push({ key: "organization", label: names.organizations[f.organization] ?? f.organization, next: drop("organization") });
  if (f.featured) out.push({ key: "featured", label: m.onlyFeatured, next: drop("featured") });
  return out;
}

/** Sticky result count, sort control and active-filter chips with individual clear. */
export function ListToolbar({
  locale,
  filter,
  total,
  names,
  children,
}: {
  locale: Locale;
  filter: VacancyFilter;
  total: number;
  names: { sectors: Record<string, string>; mahallas: Record<string, string>; organizations: Record<string, string> };
  /** the mobile filter trigger */
  children?: React.ReactNode;
}) {
  const m = getMessages(locale);
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const chips = chipsFor(filter, locale, names);

  const go = (next: VacancyFilter) => {
    const qs = filterToParams(next).toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  return (
    <div className={cn("sticky top-[var(--header-h)] z-20 -mx-4 border-b border-soft-200 bg-white-0/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0", pending && "opacity-70")} aria-busy={pending}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-label-md font-semibold text-strong-950" aria-live="polite">
          <span className="tabular">{filter.q ? m.list.resultsFor(total, filter.q) : m.list.results(total)}</span>
        </p>
        <div className="flex items-center gap-2">
          {children}
          <label htmlFor="sort" className="sr-only">
            {m.list.sort}
          </label>
          <NativeSelect
            id="sort"
            size="medium"
            value={filter.sort ?? "newest"}
            onChange={(e) => go({ ...filter, sort: e.target.value as VacancySort, page: undefined })}
            className="w-auto"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {sortLabels[locale][s]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      {(chips.length > 0 || filter.q) && (
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label={m.list.activeFilters}>
          {filter.q && (
            <li>
              <Tag label={`«${filter.q}»`} selected removeLabel={m.list.remove(filter.q)} onRemove={() => go({ ...filter, q: undefined, page: undefined })} />
            </li>
          )}
          {chips.map((c) => (
            <li key={c.key}>
              <Tag label={c.label} removeLabel={m.list.remove(c.label)} onRemove={() => go(c.next)} />
            </li>
          ))}
          {chips.length > 1 && (
            <li>
              <button type="button" onClick={() => go({ q: filter.q, sort: filter.sort })} className="text-label-sm text-sub-600 underline-offset-4 hover:text-strong-950 hover:underline focus-ring rounded-4">
                {m.list.clearAll}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
