import { getAll, getOrganizationById, getMahalla, getMahallas, getOrganizations, getSectors, getStats, getOrganizationsWithCounts } from "@/lib/vacancies";
import { employmentLabels, experienceLabels } from "@/lib/i18n/messages";
import type { EducationLevel, EmploymentType, ExperienceLevel, SectorId, WorkMode } from "@/types";

export interface Point {
  label: string;
  value: number;
  href?: string;
}

export interface DayPoint {
  date: string;
  count: number;
}

export interface AdminData {
  generatedAt: string;
  kpis: {
    openVacancies: number;
    openings: number;
    employers: number;
    averageSalary: number;
    medianSalary: number;
    newThisWeek: number;
    withPhone: number;
    withDescription: number;
    negotiable: number;
    mahallasCovered: number;
    mahallasTotal: number;
  };
  bySector: Point[];
  byMahalla: Point[];
  byDay: DayPoint[];
  salaryBuckets: Point[];
  byEmployment: Point[];
  byExperience: Point[];
  topEmployers: Point[];
  latest: {
    id: string;
    slug: string;
    title: string;
    organization: string;
    mahalla: string;
    salary: string;
    publishedAt: string;
    isFeatured: boolean;
    hasDescription: boolean;
    sourceUrl: string;
  }[];
}

const NOW = new Date("2026-09-08T12:00:00Z");

function fmt(n: number) {
  return new Intl.NumberFormat("uz-Latn-UZ").format(n).replace(/[\s ]/g, " ");
}

export function buildAdminData(): AdminData {
  const all = getAll();
  const stats = getStats(NOW);

  const bySector: Point[] = getSectors()
    .map((s) => ({ label: s.shortName.uz, value: stats.bySector[s.id], href: `/sohalar/${s.slug}` }))
    .sort((a, b) => b.value - a.value);

  const mahallaCounts = new Map<string, number>();
  let noMahalla = 0;
  for (const v of all) {
    if (v.mahallaId) mahallaCounts.set(v.mahallaId, (mahallaCounts.get(v.mahallaId) ?? 0) + 1);
    else noMahalla += 1;
  }
  const byMahalla: Point[] = [...mahallaCounts.entries()]
    .map(([id, value]) => ({ label: getMahalla(id)?.name.uz ?? id, value, href: `/vakansiyalar?mahalla=${id}` }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  byMahalla.push({ label: "Mahalla koʻrsatilmagan", value: noMahalla });

  const byDay: DayPoint[] = [];
  for (let i = 44; i >= 0; i--) {
    const d = new Date(NOW.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    byDay.push({ date: d, count: all.filter((v) => v.publishedAt === d).length });
  }

  const buckets: [string, (n: number) => boolean][] = [
    ["1 mln gacha", (n) => n < 1_000_000],
    ["1–2 mln", (n) => n >= 1_000_000 && n < 2_000_000],
    ["2–3 mln", (n) => n >= 2_000_000 && n < 3_000_000],
    ["3–4 mln", (n) => n >= 3_000_000 && n < 4_000_000],
    ["4–5 mln", (n) => n >= 4_000_000 && n < 5_000_000],
    ["5–7 mln", (n) => n >= 5_000_000 && n < 7_000_000],
    ["7 mln +", (n) => n >= 7_000_000],
  ];
  const salaryBuckets: Point[] = buckets.map(([label, test]) => ({
    label,
    value: all.filter((v) => {
      const s = v.salaryMax ?? v.salaryMin;
      return s != null && test(s);
    }).length,
  }));
  salaryBuckets.push({ label: "Kelishilgan", value: all.filter((v) => v.salaryNegotiable).length });

  const count = <K extends string>(pick: (v: (typeof all)[number]) => K, labels: Record<K, string>): Point[] => {
    const m = new Map<K, number>();
    for (const v of all) m.set(pick(v), (m.get(pick(v)) ?? 0) + 1);
    return [...m.entries()].map(([k, value]) => ({ label: labels[k], value })).sort((a, b) => b.value - a.value);
  };

  const topEmployers: Point[] = getOrganizationsWithCounts()
    .slice(0, 8)
    .map(({ organization, count: n }) => ({ label: organization.name.uz, value: n, href: `/tashkilotlar/${organization.slug}` }));

  const latest = [...all]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 12)
    .map((v) => {
      const s = v.salaryNegotiable ? "Kelishilgan" : v.salaryMin && v.salaryMax ? `${fmt(v.salaryMin)} – ${fmt(v.salaryMax)}` : fmt(v.salaryMax ?? v.salaryMin ?? 0);
      return {
        id: v.id,
        slug: v.slug,
        title: v.title.uz,
        organization: getOrganizationById(v.organizationId)?.name.uz ?? "",
        mahalla: v.mahallaId ? (getMahalla(v.mahallaId)?.name.uz ?? "") : "—",
        salary: s,
        publishedAt: v.publishedAt,
        isFeatured: v.isFeatured,
        hasDescription: !!v.description,
        sourceUrl: v.sourceUrl,
      };
    });

  return {
    generatedAt: NOW.toISOString(),
    kpis: {
      openVacancies: stats.openVacancies,
      openings: stats.openings,
      employers: stats.employers,
      averageSalary: stats.averageSalary,
      medianSalary: stats.medianSalary,
      newThisWeek: stats.newThisWeek,
      withPhone: all.filter((v) => v.phone).length,
      withDescription: all.filter((v) => v.description).length,
      negotiable: all.filter((v) => v.salaryNegotiable).length,
      mahallasCovered: stats.mahallasCovered,
      mahallasTotal: stats.mahallasTotal,
    },
    bySector,
    byMahalla,
    byDay,
    salaryBuckets,
    byEmployment: count((v) => v.employmentType, employmentLabels.uz),
    byExperience: count((v) => v.experience, experienceLabels.uz),
    topEmployers,
    latest,
  };
}

/* ------------------------------------------------------------------ */
/* Jobs grid                                                           */
/* ------------------------------------------------------------------ */

export interface AdminJob {
  id: string;
  slug: string;
  titleUz: string;
  titleRu: string;
  organizationId: string;
  organization: string;
  sectorId: SectorId;
  mahallaId: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryNegotiable: boolean;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experience: ExperienceLevel;
  educationLevel: EducationLevel;
  openings: number;
  phone: string | null;
  telegram: string | null;
  contactPerson: string | null;
  description: string;
  isFeatured: boolean;
  publishedAt: string;
  sourceUrl: string;
}

export interface AdminJobsData {
  jobs: AdminJob[];
  sectors: { id: SectorId; label: string }[];
  mahallas: { id: string; label: string }[];
  organizations: { id: string; label: string }[];
}

export function buildAdminJobs(): AdminJobsData {
  const jobs: AdminJob[] = [...getAll()]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((v) => ({
      id: v.id,
      slug: v.slug,
      titleUz: v.title.uz,
      titleRu: v.title.ru,
      organizationId: v.organizationId,
      organization: getOrganizationById(v.organizationId)?.name.uz ?? "",
      sectorId: v.sectorId,
      mahallaId: v.mahallaId,
      salaryMin: v.salaryMin,
      salaryMax: v.salaryMax,
      salaryNegotiable: v.salaryNegotiable,
      employmentType: v.employmentType,
      workMode: v.workMode,
      experience: v.experience,
      educationLevel: v.educationLevel,
      openings: v.openings,
      phone: v.phone,
      telegram: v.telegram,
      contactPerson: v.contactPerson,
      description: v.description?.uz ?? "",
      isFeatured: v.isFeatured,
      publishedAt: v.publishedAt,
      sourceUrl: v.sourceUrl,
    }));
  return {
    jobs,
    sectors: getSectors().map((s) => ({ id: s.id, label: s.shortName.uz })),
    mahallas: getMahallas().map((m) => ({ id: m.id, label: m.name.uz })),
    organizations: getOrganizations().map((o) => ({ id: o.id, label: o.name.uz })),
  };
}
