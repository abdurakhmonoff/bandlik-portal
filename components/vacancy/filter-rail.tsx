"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import type { Locale, Mahalla, Sector, VacancyFilter } from "@/types";
import { getMessages, employmentLabels, workModeLabels, experienceLabels, educationLabels, languageLabels, scheduleLabels, socialLabels, forWhomLabels } from "@/lib/i18n/messages";
import { filterToParams, activeFilterCount, EMPLOYMENT_TYPES, WORK_MODES, EXPERIENCE_LEVELS, EDUCATION_LEVELS, LANGUAGES, SCHEDULES, SOCIAL_CATEGORIES, FOR_WHOM, type Facets } from "@/lib/vacancies";
import { normalize } from "@/lib/search";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckboxField } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SALARY_MAX = 15_000_000;
const SALARY_STEP = 250_000;

type Key = keyof VacancyFilter;

function toggleIn<T extends string>(arr: T[] | undefined, value: T): T[] | undefined {
  const set = new Set(arr ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return set.size ? Array.from(set) : undefined;
}

/** All filter groups; shared by the desktop rail and the mobile sheet. */
function FilterGroups({
  locale,
  value,
  onChange,
  facets,
  sectors,
  mahallas,
}: {
  locale: Locale;
  value: VacancyFilter;
  onChange: (next: VacancyFilter) => void;
  facets: Facets;
  sectors: Sector[];
  mahallas: Mahalla[];
}) {
  const m = getMessages(locale).list;
  const [mahallaQuery, setMahallaQuery] = useState("");
  const [salary, setSalary] = useState<[number, number]>([value.salaryMin ?? 0, value.salaryMax ?? SALARY_MAX]);

  useEffect(() => {
    setSalary([value.salaryMin ?? 0, value.salaryMax ?? SALARY_MAX]);
  }, [value.salaryMin, value.salaryMax]);

  const set = <K extends Key>(key: K, v: VacancyFilter[K]) => onChange({ ...value, [key]: v, page: undefined });

  const visibleMahallas = useMemo(() => {
    const q = normalize(mahallaQuery);
    return mahallas
      .filter((x) => facets.mahalla[x.id])
      .filter((x) => !q || normalize(x.name.uz).includes(q) || normalize(x.name.ru).includes(q));
  }, [mahallas, facets.mahalla, mahallaQuery]);

  const openGroups = ["mahalla", "sector", "salary", "employment"];
  const count = (n?: number) => <span className="tabular text-label-xs text-soft-400">{n ?? 0}</span>;

  return (
    <Accordion type="multiple" defaultValue={openGroups} className="border-t border-soft-200">
      {/* mahalla */}
      <AccordionItem value="mahalla">
        <AccordionTrigger>{m.groups.mahalla}</AccordionTrigger>
        <AccordionContent>
          <Input
            size="small"
            value={mahallaQuery}
            onChange={(e) => setMahallaQuery(e.target.value)}
            placeholder={m.mahallaSearch}
            aria-label={m.mahallaSearch}
            leadingIcon={<MagnifyingGlass size={16} aria-hidden="true" />}
            className="mb-2"
          />
          <ul className="max-h-64 overflow-y-auto pr-1">
            {visibleMahallas.map((x) => (
              <li key={x.id}>
                <CheckboxField
                  checked={value.mahalla?.includes(x.id) ?? false}
                  onCheckedChange={() => set("mahalla", toggleIn(value.mahalla, x.id))}
                  label={x.name[locale]}
                  count={count(facets.mahalla[x.id])}
                />
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* sector */}
      <AccordionItem value="sector">
        <AccordionTrigger>{m.groups.sector}</AccordionTrigger>
        <AccordionContent>
          <ul>
            {sectors.map((s) => (
              <li key={s.id}>
                <CheckboxField
                  checked={value.sector?.includes(s.id) ?? false}
                  onCheckedChange={() => set("sector", toggleIn(value.sector, s.id))}
                  label={s.shortName[locale]}
                  count={count(facets.sector[s.id])}
                />
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* position */}
      <AccordionItem value="position">
        <AccordionTrigger>{m.groups.position}</AccordionTrigger>
        <AccordionContent>
          <Input
            size="small"
            defaultValue={value.position ?? ""}
            placeholder={m.positionPlaceholder}
            aria-label={m.groups.position}
            onBlur={(e) => set("position", e.target.value.trim() || undefined)}
            onKeyDown={(e) => {
              if (e.key === "Enter") set("position", (e.target as HTMLInputElement).value.trim() || undefined);
            }}
          />
        </AccordionContent>
      </AccordionItem>

      {/* salary */}
      <AccordionItem value="salary">
        <AccordionTrigger>{m.groups.salary}</AccordionTrigger>
        <AccordionContent>
          <div className="px-1 pt-2">
            <Slider
              min={0}
              max={SALARY_MAX}
              step={SALARY_STEP}
              value={salary}
              onValueChange={(v) => setSalary([v[0] ?? 0, v[1] ?? SALARY_MAX])}
              onValueCommit={(v) =>
                onChange({
                  ...value,
                  salaryMin: v[0] && v[0] > 0 ? v[0] : undefined,
                  salaryMax: v[1] != null && v[1] < SALARY_MAX ? v[1] : undefined,
                  page: undefined,
                })
              }
              formatValue={(n) => `${formatNumber(n, locale)} ${locale === "ru" ? "сум" : "soʻm"}`}
              aria-label={m.groups.salary}
            />
            <div className="mt-3 flex items-center justify-between text-label-sm text-sub-600">
              <span className="tabular">
                {m.salaryFrom} {formatNumber(salary[0], locale)}
              </span>
              <span className="tabular">
                {m.salaryTo} {salary[1] >= SALARY_MAX ? `${formatNumber(SALARY_MAX, locale)}+` : formatNumber(salary[1], locale)}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* employment */}
      <AccordionItem value="employment">
        <AccordionTrigger>{m.groups.employment}</AccordionTrigger>
        <AccordionContent>
          {EMPLOYMENT_TYPES.filter((k) => facets.employment[k]).map((k) => (
            <CheckboxField key={k} checked={value.employment?.includes(k) ?? false} onCheckedChange={() => set("employment", toggleIn(value.employment, k))} label={employmentLabels[locale][k]} count={count(facets.employment[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* mode */}
      <AccordionItem value="mode">
        <AccordionTrigger>{m.groups.mode}</AccordionTrigger>
        <AccordionContent>
          {WORK_MODES.filter((k) => facets.mode[k]).map((k) => (
            <CheckboxField key={k} checked={value.mode?.includes(k) ?? false} onCheckedChange={() => set("mode", toggleIn(value.mode, k))} label={workModeLabels[locale][k]} count={count(facets.mode[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* experience */}
      <AccordionItem value="experience">
        <AccordionTrigger>{m.groups.experience}</AccordionTrigger>
        <AccordionContent>
          {EXPERIENCE_LEVELS.filter((k) => facets.experience[k]).map((k) => (
            <CheckboxField key={k} checked={value.experience?.includes(k) ?? false} onCheckedChange={() => set("experience", toggleIn(value.experience, k))} label={experienceLabels[locale][k]} count={count(facets.experience[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* education */}
      <AccordionItem value="education">
        <AccordionTrigger>{m.groups.education}</AccordionTrigger>
        <AccordionContent>
          {EDUCATION_LEVELS.filter((k) => facets.education[k]).map((k) => (
            <CheckboxField key={k} checked={value.education?.includes(k) ?? false} onCheckedChange={() => set("education", toggleIn(value.education, k))} label={educationLabels[locale][k]} count={count(facets.education[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* language */}
      <AccordionItem value="language">
        <AccordionTrigger>{m.groups.language}</AccordionTrigger>
        <AccordionContent>
          {LANGUAGES.filter((k) => facets.language[k]).map((k) => (
            <CheckboxField key={k} checked={value.language?.includes(k) ?? false} onCheckedChange={() => set("language", toggleIn(value.language, k))} label={languageLabels[locale][k]} count={count(facets.language[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* schedule */}
      <AccordionItem value="schedule">
        <AccordionTrigger>{m.groups.schedule}</AccordionTrigger>
        <AccordionContent>
          {SCHEDULES.filter((k) => facets.schedule[k]).map((k) => (
            <CheckboxField key={k} checked={value.schedule?.includes(k) ?? false} onCheckedChange={() => set("schedule", toggleIn(value.schedule, k))} label={scheduleLabels[locale][k]} count={count(facets.schedule[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* social */}
      <AccordionItem value="social">
        <AccordionTrigger>{m.groups.social}</AccordionTrigger>
        <AccordionContent>
          {SOCIAL_CATEGORIES.map((k) => (
            <CheckboxField key={k} checked={value.social?.includes(k) ?? false} onCheckedChange={() => set("social", toggleIn(value.social, k))} label={socialLabels[locale][k]} count={count(facets.social[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* for whom */}
      <AccordionItem value="forWhom">
        <AccordionTrigger>{m.groups.forWhom}</AccordionTrigger>
        <AccordionContent>
          {FOR_WHOM.map((k) => (
            <CheckboxField key={k} checked={value.forWhom?.includes(k) ?? false} onCheckedChange={() => set("forWhom", toggleIn(value.forWhom, k))} label={forWhomLabels[locale][k]} count={count(facets.forWhom[k])} />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* age */}
      <AccordionItem value="age">
        <AccordionTrigger>{m.groups.age}</AccordionTrigger>
        <AccordionContent>
          <Input
            size="small"
            type="number"
            inputMode="numeric"
            min={16}
            max={70}
            defaultValue={value.age ?? ""}
            placeholder={m.agePlaceholder}
            aria-label={m.groups.age}
            aria-describedby="age-hint"
            onBlur={(e) => {
              const n = Number(e.target.value);
              set("age", Number.isFinite(n) && n >= 16 && n <= 70 ? n : undefined);
            }}
          />
          <p id="age-hint" className="mt-1.5 text-label-xs text-soft-400">
            {m.ageHint}
          </p>
        </AccordionContent>
      </AccordionItem>

      {/* featured */}
      <AccordionItem value="featured">
        <AccordionTrigger>{m.groups.featured}</AccordionTrigger>
        <AccordionContent>
          <CheckboxField checked={value.featured ?? false} onCheckedChange={(c) => set("featured", c === true ? true : undefined)} label={m.onlyFeatured} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Left filter rail (desktop) and bottom sheet (mobile). The URL is the
 * single source of truth: every change is pushed as query params.
 */
export function FilterRail({
  locale,
  filter,
  facets,
  sectors,
  mahallas,
  total,
}: {
  locale: Locale;
  filter: VacancyFilter;
  facets: Facets;
  sectors: Sector[];
  mahallas: Mahalla[];
  total: number;
}) {
  const m = getMessages(locale).list;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<VacancyFilter>(filter);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setDraft(filter);
  }, [filter]);

  const push = useCallback(
    (next: VacancyFilter) => {
      const qs = filterToParams(next).toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname],
  );

  const activeCount = activeFilterCount(filter);
  const draftCount = activeFilterCount(draft);

  const clearAll = () => push({ q: filter.q, sort: filter.sort });

  return (
    <>
      {/* desktop rail */}
      <aside className="hidden lg:block" aria-label={m.filters} data-pending={pending || undefined}>
        <div className="sticky top-[calc(var(--header-h)+1rem)] max-h-[calc(100dvh-var(--header-h)-2rem)] overflow-y-auto pr-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-label-md font-semibold text-strong-950">
              {m.filters}
              {activeCount > 0 && <span className="tabular ml-2 rounded-full bg-primary-alpha-10 px-2 py-0.5 text-label-xs text-primary-base">{activeCount}</span>}
            </h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-label-sm text-sub-600 underline-offset-4 hover:text-strong-950 hover:underline focus-ring rounded-4">
                {m.clearAll}
              </button>
            )}
          </div>
          <FilterGroups locale={locale} value={filter} onChange={push} facets={facets} sectors={sectors} mahallas={mahallas} />
        </div>
      </aside>

      {/* mobile trigger + sheet */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="neutral" mode="stroke" size="medium" leadingIcon={<Funnel size={20} aria-hidden="true" />} className={cn(activeCount > 0 && "border-strong-950")}>
              {m.openFilters}
              {activeCount > 0 && <span className="tabular ml-1 rounded-full bg-strong-950 px-1.5 py-0.5 text-label-xs text-white-0">{activeCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" closeLabel={getMessages(locale).nav.close}>
            <SheetHeader>
              <SheetTitle>{m.filters}</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <FilterGroups locale={locale} value={draft} onChange={setDraft} facets={facets} sectors={sectors} mahallas={mahallas} />
            </SheetBody>
            <SheetFooter className="flex gap-2">
              <Button
                variant="neutral"
                mode="stroke"
                size="medium"
                onClick={() => setDraft({ q: filter.q, sort: filter.sort })}
                disabled={draftCount === 0}
                className="flex-1"
              >
                {m.clearAll}
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={() => {
                  push(draft);
                  setSheetOpen(false);
                }}
                className="flex-[2]"
              >
                {draftCount === activeCount ? m.showResults(total) : getMessages(locale).common.apply}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
