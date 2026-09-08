/**
 * Data-access layer. Every read in the app goes through here so the source
 * (today: typed seed files) can be swapped without touching a component.
 */
import { vacancies as seed } from "@/data/vacancies";
import { organizations as orgSeed } from "@/data/organizations";
import { mahallas as mahallaSeed } from "@/data/mahallas";
import { sectors as sectorSeed, sectorById } from "@/data/sectors";
import { matchScore, normalize } from "@/lib/search";
import type {
  EducationLevel,
  EmploymentType,
  ExperienceLevel,
  ForWhom,
  LanguageCode,
  Locale,
  Mahalla,
  Organization,
  Schedule,
  Sector,
  SectorId,
  SocialCategory,
  Vacancy,
  VacancyFilter,
  VacancySort,
  VacancyStats,
  WorkMode,
} from "@/types";

export const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/* Basic reads                                                         */
/* ------------------------------------------------------------------ */

export function getAll(): Vacancy[] {
  return seed;
}

export function getBySlug(slug: string): Vacancy | undefined {
  return seed.find((v) => v.slug === slug);
}

export function getById(id: string): Vacancy | undefined {
  return seed.find((v) => v.id === id);
}

export function getRecent(n = 8): Vacancy[] {
  return [...seed].sort(byNewest).slice(0, n);
}

export function getFeatured(): Vacancy[] {
  return seed.filter((v) => v.isFeatured);
}

export function getByOrganization(organizationId: string): Vacancy[] {
  return seed.filter((v) => v.organizationId === organizationId).sort(byNewest);
}

export function getBySector(sectorId: SectorId): Vacancy[] {
  return seed.filter((v) => v.sectorId === sectorId).sort(byNewest);
}

/* ------------------------------------------------------------------ */
/* Sectors, organisations, mahallas                                    */
/* ------------------------------------------------------------------ */

export function getSectors(): Sector[] {
  return [...sectorSeed].sort((a, b) => a.order - b.order);
}

export function getSector(slug: string): Sector | undefined {
  return sectorSeed.find((s) => s.slug === slug);
}

export function getSectorById(id: SectorId): Sector {
  return sectorById[id];
}

export function countBySector(): Record<SectorId, number> {
  const counts = Object.fromEntries(sectorSeed.map((s) => [s.id, 0])) as Record<SectorId, number>;
  for (const v of seed) counts[v.sectorId] += 1;
  return counts;
}

export function getOrganizations(): Organization[] {
  return orgSeed;
}

export function getOrganizationsWithCounts(): { organization: Organization; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of seed) counts.set(v.organizationId, (counts.get(v.organizationId) ?? 0) + 1);
  return orgSeed
    .map((organization) => ({ organization, count: counts.get(organization.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.organization.name.uz.localeCompare(b.organization.name.uz));
}

export function getMajorEmployers(n = 8): { organization: Organization; count: number }[] {
  return getOrganizationsWithCounts()
    .filter((o) => o.organization.isMajor)
    .slice(0, n);
}

export function getOrganization(slug: string): Organization | undefined {
  return orgSeed.find((o) => o.slug === slug);
}

export function getOrganizationById(id: string): Organization | undefined {
  return orgSeed.find((o) => o.id === id);
}

export function getMahallas(): Mahalla[] {
  return mahallaSeed;
}

export function getMahalla(id: string): Mahalla | undefined {
  return mahallaSeed.find((m) => m.id === id);
}

export function countByMahalla(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of seed) if (v.mahallaId) counts[v.mahallaId] = (counts[v.mahallaId] ?? 0) + 1;
  return counts;
}

/* ------------------------------------------------------------------ */
/* Search + filter                                                     */
/* ------------------------------------------------------------------ */

/** Text that a free-text query is matched against. */
function haystack(v: Vacancy): string {
  const org = getOrganizationById(v.organizationId);
  const sector = sectorById[v.sectorId];
  const mahalla = v.mahallaId ? getMahalla(v.mahallaId) : undefined;
  return [
    v.title.uz,
    v.title.ru,
    org?.name.uz,
    org?.name.ru,
    sector.name.uz,
    sector.name.ru,
    sector.shortName.uz,
    mahalla?.name.uz,
    mahalla?.name.ru,
    v.address,
  ]
    .filter(Boolean)
    .join(" ");
}

const haystackCache = new Map<string, string>();
function hay(v: Vacancy): string {
  let h = haystackCache.get(v.id);
  if (!h) {
    h = haystack(v);
    haystackCache.set(v.id, h);
  }
  return h;
}

export function search(q: string, limit = 10): Vacancy[] {
  const query = q.trim();
  if (!query) return [];
  return seed
    .map((v) => ({ v, score: matchScore(query, hay(v)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.v, b.v))
    .slice(0, limit)
    .map((r) => r.v);
}

export interface FilterResult {
  items: Vacancy[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export function filter(f: VacancyFilter): FilterResult {
  let list = seed.filter((v) => matches(v, f));
  if (f.q) {
    const scored = list
      .map((v) => ({ v, score: matchScore(f.q!, hay(v)) }))
      .filter((r) => r.score > 0);
    // relevance first, then the chosen sort within equal relevance
    list = scored
      .sort((a, b) => b.score - a.score || sorter(f.sort ?? "newest")(a.v, b.v))
      .map((r) => r.v);
  } else {
    list = [...list].sort(sorter(f.sort ?? "newest"));
  }
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page ?? 1), totalPages);
  return {
    items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
  };
}

export function count(f: VacancyFilter): number {
  return seed.filter((v) => matches(v, f)).length;
}

function matches(v: Vacancy, f: VacancyFilter): boolean {
  if (f.mahalla?.length && (!v.mahallaId || !f.mahalla.includes(v.mahallaId))) return false;
  if (f.sector?.length && !f.sector.includes(v.sectorId)) return false;
  if (f.organization && v.organizationId !== f.organization) return false;
  if (f.position && !normalize(v.title.uz + " " + v.title.ru).includes(normalize(f.position))) return false;
  if (f.salaryMin != null) {
    const top = v.salaryMax ?? v.salaryMin;
    if (top == null || top < f.salaryMin) return false;
  }
  if (f.salaryMax != null) {
    const low = v.salaryMin ?? v.salaryMax;
    if (low == null || low > f.salaryMax) return false;
  }
  if (f.employment?.length && !f.employment.includes(v.employmentType)) return false;
  if (f.mode?.length && !f.mode.includes(v.workMode)) return false;
  if (f.experience?.length && !f.experience.includes(v.experience)) return false;
  if (f.education?.length && !f.education.includes(v.educationLevel)) return false;
  if (f.language?.length && !v.languages.some((l) => f.language!.includes(l.code))) return false;
  if (f.schedule?.length && (!v.schedule || !f.schedule.includes(v.schedule))) return false;
  if (f.social?.length && !v.socialCategories.some((s) => f.social!.includes(s))) return false;
  if (f.forWhom?.length && !v.forWhom.some((s) => f.forWhom!.includes(s))) return false;
  if (f.age != null) {
    if (v.ageMin != null && f.age < v.ageMin) return false;
    if (v.ageMax != null && f.age > v.ageMax) return false;
  }
  if (f.featured && !v.isFeatured) return false;
  return true;
}

function byNewest(a: Vacancy, b: Vacancy): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.title.uz.localeCompare(b.title.uz);
}

function salaryOf(v: Vacancy): number {
  return v.salaryMax ?? v.salaryMin ?? -1;
}

function sorter(sort: VacancySort): (a: Vacancy, b: Vacancy) => number {
  switch (sort) {
    case "oldest":
      return (a, b) => -byNewest(a, b);
    case "salary-asc":
      // negotiable (no figure) sinks to the end in both directions
      return (a, b) => {
        const sa = salaryOf(a), sb = salaryOf(b);
        if (sa < 0 && sb < 0) return byNewest(a, b);
        if (sa < 0) return 1;
        if (sb < 0) return -1;
        return sa - sb || byNewest(a, b);
      };
    case "salary-desc":
      return (a, b) => {
        const sa = salaryOf(a), sb = salaryOf(b);
        if (sa < 0 && sb < 0) return byNewest(a, b);
        if (sa < 0) return 1;
        if (sb < 0) return -1;
        return sb - sa || byNewest(a, b);
      };
    default:
      return byNewest;
  }
}

export function getSimilar(v: Vacancy, n = 4): Vacancy[] {
  const titleTokens = normalize(v.title.uz).split(" ");
  return seed
    .filter((o) => o.id !== v.id)
    .map((o) => {
      let score = 0;
      if (o.sectorId === v.sectorId) score += 3;
      if (o.organizationId === v.organizationId) score += 1;
      if (o.mahallaId && o.mahallaId === v.mahallaId) score += 2;
      const oTitle = normalize(o.title.uz);
      for (const t of titleTokens) if (t.length > 3 && oTitle.includes(t)) score += 4;
      return { o, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.o, b.o))
    .slice(0, n)
    .map((r) => r.o);
}

/* ------------------------------------------------------------------ */
/* Stats + facets                                                      */
/* ------------------------------------------------------------------ */

export function getStats(now = new Date("2026-09-08")): VacancyStats {
  const salaries = seed
    .map((v) => (v.salaryMin && v.salaryMax ? (v.salaryMin + v.salaryMax) / 2 : (v.salaryMax ?? v.salaryMin)))
    .filter((s): s is number => typeof s === "number" && s > 0)
    .sort((a, b) => a - b);
  const avg = salaries.length ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;
  const median = salaries.length ? salaries[Math.floor(salaries.length / 2)] : 0;
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const covered = new Set(seed.map((v) => v.mahallaId).filter(Boolean)).size;
  return {
    openVacancies: seed.length,
    openings: seed.reduce((a, v) => a + v.openings, 0),
    employers: new Set(seed.map((v) => v.organizationId)).size,
    averageSalary: Math.round(avg / 10_000) * 10_000,
    medianSalary: median,
    mahallasCovered: covered,
    mahallasTotal: mahallaSeed.length,
    bySector: countBySector(),
    newThisWeek: seed.filter((v) => v.publishedAt >= weekAgo).length,
  };
}

export interface Facets {
  sector: Partial<Record<SectorId, number>>;
  mahalla: Record<string, number>;
  employment: Partial<Record<EmploymentType, number>>;
  mode: Partial<Record<WorkMode, number>>;
  experience: Partial<Record<ExperienceLevel, number>>;
  education: Partial<Record<EducationLevel, number>>;
  language: Partial<Record<LanguageCode, number>>;
  schedule: Partial<Record<Schedule, number>>;
  social: Partial<Record<SocialCategory, number>>;
  forWhom: Partial<Record<ForWhom, number>>;
}

/** Counts for every filter option across the whole dataset. */
export function getFacets(): Facets {
  const inc = <K extends string>(rec: Partial<Record<K, number>>, key: K | null | undefined) => {
    if (key) rec[key] = (rec[key] ?? 0) + 1;
  };
  const f: Facets = { sector: {}, mahalla: {}, employment: {}, mode: {}, experience: {}, education: {}, language: {}, schedule: {}, social: {}, forWhom: {} };
  for (const v of seed) {
    inc(f.sector, v.sectorId);
    inc(f.mahalla, v.mahallaId);
    inc(f.employment, v.employmentType);
    inc(f.mode, v.workMode);
    inc(f.experience, v.experience);
    inc(f.education, v.educationLevel);
    for (const l of v.languages) inc(f.language, l.code);
    inc(f.schedule, v.schedule);
    for (const s of v.socialCategories) inc(f.social, s);
    for (const w of v.forWhom) inc(f.forWhom, w);
  }
  return f;
}

/* ------------------------------------------------------------------ */
/* URL <-> filter                                                      */
/* ------------------------------------------------------------------ */

type Params = Record<string, string | string[] | undefined>;

function list<T extends string>(p: Params, key: string, allowed?: readonly T[]): T[] | undefined {
  const raw = p[key];
  if (!raw) return undefined;
  const arr = (Array.isArray(raw) ? raw : raw.split(",")).map((s) => s.trim()).filter(Boolean) as T[];
  const out = allowed ? arr.filter((x) => allowed.includes(x)) : arr;
  return out.length ? out : undefined;
}

function num(p: Params, key: string): number | undefined {
  const raw = p[key];
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return undefined;
  const n = Number(s.replace(/\s/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function str(p: Params, key: string): string | undefined {
  const raw = p[key];
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s?.trim() ? s.trim().slice(0, 100) : undefined;
}

export const EMPLOYMENT_TYPES: readonly EmploymentType[] = ["permanent", "fixed-term", "seasonal", "internship", "daily"];
export const WORK_MODES: readonly WorkMode[] = ["onsite", "shift", "remote", "hybrid", "home", "mobile"];
export const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = ["none", "under-1", "1-3", "3-5", "5-plus"];
export const EDUCATION_LEVELS: readonly EducationLevel[] = ["any", "secondary-special", "bachelor", "master", "phd"];
export const LANGUAGES: readonly LanguageCode[] = ["uz", "ru", "en", "tr", "ko", "zh", "de", "ja", "hi", "es", "fr", "pt"];
export const SCHEDULES: readonly Schedule[] = ["6/1", "5/2", "4/4", "4/3", "4/2", "3/3", "3/2", "2/2", "2/1", "1/3", "1/2", "flexible"];
export const SOCIAL_CATEGORIES: readonly SocialCategory[] = ["disability", "domestic-violence-survivors", "social-register", "orphans", "released-from-prison", "trafficking-survivors"];
export const FOR_WHOM: readonly ForWhom[] = ["disability", "graduates", "students"];
export const SORTS: readonly VacancySort[] = ["newest", "oldest", "salary-asc", "salary-desc"];

export function parseFilter(p: Params): VacancyFilter {
  const sectorIds = sectorSeed.map((s) => s.id);
  const sort = str(p, "sort") as VacancySort | undefined;
  return {
    q: str(p, "q"),
    mahalla: list(p, "mahalla"),
    sector: list(p, "soha", sectorIds),
    position: str(p, "lavozim"),
    salaryMin: num(p, "maoshdan"),
    salaryMax: num(p, "maoshgacha"),
    employment: list(p, "bandlik", EMPLOYMENT_TYPES),
    mode: list(p, "rejim", WORK_MODES),
    experience: list(p, "tajriba", EXPERIENCE_LEVELS),
    education: list(p, "malumot", EDUCATION_LEVELS),
    language: list(p, "til", LANGUAGES),
    schedule: list(p, "kunlar", SCHEDULES),
    social: list(p, "toifa", SOCIAL_CATEGORIES),
    forWhom: list(p, "kimlar", FOR_WHOM),
    age: num(p, "yosh"),
    organization: str(p, "tashkilot"),
    featured: str(p, "alohida") === "1" ? true : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num(p, "sahifa"),
  };
}

/** Inverse of parseFilter — used to build shareable URLs. */
export function filterToParams(f: VacancyFilter): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | undefined | null) => {
    if (v != null && v !== "") p.set(k, String(v));
  };
  const setList = (k: string, v: string[] | undefined) => {
    if (v?.length) p.set(k, v.join(","));
  };
  set("q", f.q);
  setList("mahalla", f.mahalla);
  setList("soha", f.sector);
  set("lavozim", f.position);
  set("maoshdan", f.salaryMin);
  set("maoshgacha", f.salaryMax);
  setList("bandlik", f.employment);
  setList("rejim", f.mode);
  setList("tajriba", f.experience);
  setList("malumot", f.education);
  setList("til", f.language);
  setList("kunlar", f.schedule);
  setList("toifa", f.social);
  setList("kimlar", f.forWhom);
  set("yosh", f.age);
  set("tashkilot", f.organization);
  if (f.featured) p.set("alohida", "1");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("sahifa", String(f.page));
  return p;
}

/** Number of active filters (excluding sort/page/q). */
export function activeFilterCount(f: VacancyFilter): number {
  let n = 0;
  const keys: (keyof VacancyFilter)[] = ["mahalla", "sector", "position", "salaryMin", "salaryMax", "employment", "mode", "experience", "education", "language", "schedule", "social", "forWhom", "age", "organization", "featured"];
  for (const k of keys) {
    const v = f[k];
    if (Array.isArray(v)) n += v.length;
    else if (v != null && v !== "" && v !== false) n += 1;
  }
  return n;
}

/** Helper for locale-aware reads in components. */
export function t(loc: Locale, s: { uz: string; ru: string }): string {
  return s[loc];
}
