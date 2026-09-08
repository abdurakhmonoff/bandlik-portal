"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/rare/animated-counter";
import type { Locale, VacancyStats } from "@/types";
import { getMessages } from "@/lib/i18n/messages";

/**
 * Stats sit on the hill's baseline as one printed line. Counters run once,
 * when the strip scrolls into view.
 */
export function StatsStrip({ stats, locale }: { stats: VacancyStats; locale: Locale }) {
  const m = getMessages(locale);
  const ref = useRef<HTMLDListElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const salaryMln = Math.round(stats.averageSalary / 100_000) / 10;
  const items: { key: string; value: number; decimals?: number; suffix?: string; label: string; sr: string }[] = [
    { key: "open", value: stats.openVacancies, label: m.home.stats.open, sr: String(stats.openVacancies) },
    { key: "employers", value: stats.employers, label: m.home.stats.employers, sr: String(stats.employers) },
    {
      key: "salary",
      value: salaryMln,
      decimals: 1,
      suffix: ` ${locale === "ru" ? "млн" : "mln"}`,
      label: m.home.stats.salary,
      sr: `${salaryMln} ${locale === "ru" ? "млн сум" : "mln soʻm"}`,
    },
    {
      key: "mahallas",
      value: stats.mahallasCovered,
      suffix: ` / ${stats.mahallasTotal}`,
      label: m.home.stats.mahallas,
      sr: `${stats.mahallasCovered} / ${stats.mahallasTotal}`,
    },
  ];

  return (
    <dl ref={ref} className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 sm:gap-x-8">
      {items.map((it) => (
        <div key={it.key} className="flex flex-col-reverse gap-1 border-l-2 border-primary-base pl-4">
          <dt className="text-label-sm text-sub-600">{it.label}</dt>
          <dd className="font-display tabular text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-strong-950 sm:text-[2.25rem]">
            <span className="sr-only">{it.sr}</span>
            <span aria-hidden="true" className="inline-flex items-baseline">
              <AnimatedCounter
                value={it.value}
                decimals={it.decimals ?? 0}
                separator=" "
                decimalSeparator=","
                duration={1.4}
                inView={inView}
              />
              {it.suffix && <span className="ml-1 text-[0.6em] font-semibold text-sub-600">{it.suffix}</span>}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
