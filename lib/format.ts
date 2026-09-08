import type { Locale, Vacancy } from "@/types";
import { intlLocale } from "@/lib/i18n/config";

const UNIT: Record<Locale, string> = { uz: "soʻm", ru: "сум" };
const MILLION: Record<Locale, string> = { uz: "mln", ru: "млн" };

/** 5000000 → "5 000 000" (narrow no-break spaces so the number never wraps). */
export function formatNumber(n: number, locale: Locale = "uz"): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 })
    .format(n)
    .replace(/[\s ]/g, " ");
}

/** Compact salary for tight spaces: 5 000 000 → "5 mln", 3 500 000 → "3,5 mln". */
export function formatCompactSum(n: number, locale: Locale = "uz"): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const s = (Math.round(m * 10) / 10).toString().replace(".", locale === "ru" ? "," : ",");
    return `${s} ${MILLION[locale]}`;
  }
  return formatNumber(n, locale);
}

export type SalaryDisplay = {
  /** Main figure, e.g. "3 500 000 – 5 000 000" or "Kelishilgan holda" */
  value: string;
  /** Unit line, e.g. "soʻm / oy"; empty when negotiable */
  unit: string;
  negotiable: boolean;
};

const PERIOD: Record<Locale, Record<Vacancy["paymentType"], string>> = {
  uz: { monthly: "oy", piecework: "ishbay", hourly: "soat", contract: "shartnoma" },
  ru: { monthly: "мес.", piecework: "сдельно", hourly: "час", contract: "договор" },
};

export function formatSalary(v: Pick<Vacancy, "salaryMin" | "salaryMax" | "salaryNegotiable" | "paymentType">, locale: Locale, compact = false): SalaryDisplay {
  const fmt = compact ? formatCompactSum : formatNumber;
  const negotiableLabel = locale === "ru" ? "По договорённости" : "Kelishilgan holda";
  if (v.salaryNegotiable || (!v.salaryMin && !v.salaryMax)) {
    return { value: negotiableLabel, unit: "", negotiable: true };
  }
  const unit = `${UNIT[locale]} / ${PERIOD[locale][v.paymentType]}`;
  if (v.salaryMin && v.salaryMax && v.salaryMin !== v.salaryMax) {
    return { value: `${fmt(v.salaryMin, locale)} – ${fmt(v.salaryMax, locale)}`, unit, negotiable: false };
  }
  const single = v.salaryMax ?? v.salaryMin ?? 0;
  const prefix = v.salaryMin && !v.salaryMax ? (locale === "ru" ? "от " : "") : "";
  const suffix = v.salaryMin && !v.salaryMax && locale === "uz" ? " dan" : "";
  return { value: `${prefix}${fmt(single, locale)}${suffix}`, unit, negotiable: false };
}

/** ISO date → "8-sentabr, 2026" / "8 сентября 2026" */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  if (locale === "ru") {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  }
  const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  return `${d.getUTCDate()}-${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

/** Relative age of a listing: "bugun", "kecha", "5 kun oldin", "3 hafta oldin" */
export function formatRelative(iso: string, locale: Locale, now = new Date()): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  const days = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86_400_000));
  if (locale === "ru") {
    if (days === 0) return "сегодня";
    if (days === 1) return "вчера";
    if (days < 7) return `${days} ${plural(days, "день", "дня", "дней")} назад`;
    const w = Math.floor(days / 7);
    if (days < 30) return `${w} ${plural(w, "неделю", "недели", "недель")} назад`;
    const m = Math.floor(days / 30);
    return `${m} ${plural(m, "месяц", "месяца", "месяцев")} назад`;
  }
  if (days === 0) return "bugun";
  if (days === 1) return "kecha";
  if (days < 7) return `${days} kun oldin`;
  if (days < 30) return `${Math.floor(days / 7)} hafta oldin`;
  return `${Math.floor(days / 30)} oy oldin`;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/** "+998998009494" → "+998 99 800 94 94" */
export function formatPhone(phone: string): string {
  const m = phone.replace(/\D/g, "").match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : phone;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** "Farruxjon Shamsiyev Farhod Oʻgʻli" → "F. Shamsiyev" style is wrong for Uzbek names; keep the first two words. */
export function shortPersonName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(" ");
}
