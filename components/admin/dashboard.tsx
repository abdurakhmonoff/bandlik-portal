"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowSquareOut, Star, Phone, TextAlignLeft, MapPin, Buildings, Briefcase, CurrencyCircleDollar, Sparkle } from "@phosphor-icons/react";
import type { AdminData } from "@/lib/admin/data";
import { AnimatedCounter } from "@/components/rare/animated-counter";
import { AdminShell } from "@/components/admin/shell";
import { AreaLine, BarsH, BarsV, ChartCard, Segments } from "@/components/admin/charts";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

function Kpi({ icon: Icon, label, value, suffix, hint, decimals = 0, delay = 0 }: { icon: typeof Star; label: string; value: number; suffix?: string; hint?: string; decimals?: number; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30, delay }}
      className="rounded-16 border border-soft-200 bg-white-0 p-4"
    >
      <div className="flex items-center gap-2 text-label-xs text-sub-600">
        <Icon size={16} aria-hidden="true" className="text-primary-base" />
        {label}
      </div>
      <p className="font-display tabular mt-2 text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-strong-950">
        <AnimatedCounter value={value} decimals={decimals} separator=" " decimalSeparator="," duration={1.2} />
        {suffix && <span className="ml-1 text-[0.6em] font-semibold text-sub-600">{suffix}</span>}
      </p>
      {hint && <p className="mt-1.5 text-label-xs text-soft-400">{hint}</p>}
    </motion.div>
  );
}

export function Dashboard({ data }: { data: AdminData }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setNow(`${formatDate(d.toISOString().slice(0, 10), "uz")}, ${hh}:${mm}`);
  }, []);
  const k = data.kpis;
  const pct = (n: number) => `${Math.round((n / k.openVacancies) * 100)}%`;

  return (
    <AdminShell>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-title-h4 sm:text-title-h3">Umumiy koʻrsatkichlar</h1>
            <p className="mt-1 text-paragraph-sm text-sub-600">
              Maʼlumotlar Oson Ish eksportidan, 2026-yil 8-sentabr holatiga. {now && <span className="text-soft-400">Ochilgan: {now}</span>}
            </p>
          </div>
          <span className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-success-lighter px-3 text-label-xs font-medium text-success-base">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success-base" />
            Sayt ishlayapti
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={Briefcase} label="Ochiq vakansiyalar" value={k.openVacancies} hint={`${k.openings} ta ish oʻrni`} />
          <Kpi icon={Buildings} label="Ish beruvchilar" value={k.employers} hint="faol eʼlon bilan" delay={0.05} />
          <Kpi icon={CurrencyCircleDollar} label="Oʻrtacha maosh" value={Math.round(k.averageSalary / 100_000) / 10} decimals={1} suffix="mln" hint={`mediana ${Math.round(k.medianSalary / 100_000) / 10} mln`} delay={0.1} />
          <Kpi icon={Sparkle} label="Shu hafta yangi" value={k.newThisWeek} hint="oxirgi 7 kun" delay={0.15} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={MapPin} label="Mahalla qamrovi" value={k.mahallasCovered} suffix={`/ ${k.mahallasTotal}`} hint="vakansiyasi bor mahallalar" delay={0.2} />
          <Kpi icon={Phone} label="Telefon koʻrsatilgan" value={k.withPhone} hint={pct(k.withPhone)} delay={0.25} />
          <Kpi icon={TextAlignLeft} label="Tavsifi bor" value={k.withDescription} hint={`${pct(k.withDescription)} — ish beruvchilar toʻldirishi kerak`} delay={0.3} />
          <Kpi icon={Star} label="Maoshi kelishilgan" value={k.negotiable} hint={`${pct(k.negotiable)} — summasi koʻrsatilmagan`} delay={0.35} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ChartCard title="Eʼlonlar oqimi" lead="Oxirgi 45 kunda kuniga nechta vakansiya eʼlon qilingan" className="lg:col-span-2">
            <AreaLine data={data.byDay} />
          </ChartCard>
          <ChartCard title="Maosh taqsimoti" lead="Koʻrsatilgan yuqori chegara boʻyicha">
            <BarsV data={data.salaryBuckets} height={170} />
          </ChartCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ChartCard title="Sohalar boʻyicha" lead="Taʼlim ustunlik qiladi — maktab va bogʻchalar">
            <BarsH data={data.bySector} />
          </ChartCard>
          <ChartCard title="Mahallalar boʻyicha" lead="Eng koʻp vakansiyali 10 mahalla">
            <BarsH data={data.byMahalla} tone="ink" />
          </ChartCard>
          <ChartCard title="Yirik ish beruvchilar" lead="Ochiq oʻrinlar soni boʻyicha">
            <BarsH data={data.topEmployers} />
          </ChartCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Bandlik turi" lead="Barcha vakansiyalar ulushi">
            <Segments data={data.byEmployment} />
          </ChartCard>
          <ChartCard title="Talab qilinadigan tajriba" lead="Barcha vakansiyalar ulushi">
            <Segments data={data.byExperience} />
          </ChartCard>
        </div>

        <ChartCard title="Soʻnggi vakansiyalar" lead="Oxirgi 12 ta eʼlon — sifat nazorati uchun" className="mt-4" action={<Link href="/vakansiyalar" className="text-label-sm font-medium text-strong-950 underline-offset-4 hover:underline focus-ring rounded-4">Barchasi</Link>}>
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[56rem] text-label-sm">
              <thead>
                <tr className="border-b border-soft-200 text-left text-label-xs text-sub-600">
                  <th className="px-5 py-2 font-medium">Vakansiya</th>
                  <th className="px-3 py-2 font-medium">Tashkilot</th>
                  <th className="px-3 py-2 font-medium">Mahalla</th>
                  <th className="px-3 py-2 text-right font-medium">Maosh, soʻm</th>
                  <th className="px-3 py-2 font-medium">Sana</th>
                  <th className="px-3 py-2 font-medium">Holat</th>
                  <th className="px-5 py-2 text-right font-medium">Manba</th>
                </tr>
              </thead>
              <tbody>
                {data.latest.map((v) => (
                  <tr key={v.id} className="border-b border-soft-200 last:border-0 hover:bg-qum-50">
                    <td className="px-5 py-2.5">
                      <Link href={`/vakansiyalar/${v.slug}`} className="font-medium text-strong-950 hover:text-primary-base focus-ring rounded-4">
                        {v.title}
                      </Link>
                    </td>
                    <td className="max-w-[16rem] truncate px-3 py-2.5 text-sub-600">{v.organization}</td>
                    <td className="px-3 py-2.5 text-sub-600">{v.mahalla}</td>
                    <td className="tabular px-3 py-2.5 text-right text-strong-950">{v.salary}</td>
                    <td className="tabular px-3 py-2.5 text-sub-600">{v.publishedAt}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap gap-1">
                        {v.isFeatured && <span className="rounded-full bg-oltin-100 px-2 py-0.5 text-label-xs text-oltin-800">Alohida</span>}
                        <span className={cn("rounded-full px-2 py-0.5 text-label-xs", v.hasDescription ? "bg-success-lighter text-success-base" : "bg-weak-50 text-sub-600")}>
                          {v.hasDescription ? "Tavsif bor" : "Tavsif yoʻq"}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sub-600 hover:text-strong-950 focus-ring rounded-4" aria-label={`Oson Ish: ${v.title}`}>
                        Oson Ish <ArrowSquareOut size={12} aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <p className="mt-8 text-label-xs text-soft-400">
          Panel faqat oʻqish uchun: maʼlumotlar saytning oʻzidan hisoblanadi, hech narsa saqlanmaydi. Kirish parolining oʻzi himoya emas — ishga tushirishdan oldin haqiqiy autentifikatsiya kerak.
        </p>
    </AdminShell>
  );
}
