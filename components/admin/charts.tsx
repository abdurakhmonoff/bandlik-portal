"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { DayPoint, Point } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn SVG/HTML charts in brand tokens, one hue per chart (magnitude
 * = sequential red). Identity is carried by labels, never by colour alone.
 * Marks animate once on mount: bars grow from the baseline, the line draws.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

export function ChartCard({ title, lead, children, className, action }: { title: string; lead?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-16 border border-soft-200 bg-white-0 p-5", className)} aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-sans text-label-md font-semibold text-strong-950">{title}</h2>
          {lead && <p className="mt-0.5 text-label-xs text-sub-600">{lead}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Horizontal bars: label left, bar, value right. */
export function BarsH({ data, max: maxProp, format = (n) => String(n), tone = "primary" }: { data: Point[]; max?: number; format?: (n: number) => string; tone?: "primary" | "ink" }) {
  const reduce = useReducedMotion();
  const max = maxProp ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="flex flex-col gap-2.5" role="list">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <li key={d.label} className="group grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-label-sm">
            <span className="truncate text-strong-950" title={d.label}>
              {d.href ? (
                <a href={d.href} className="hover:text-primary-base focus-ring rounded-4">
                  {d.label}
                </a>
              ) : (
                d.label
              )}
            </span>
            <span className="relative h-2.5 overflow-hidden rounded-full bg-weak-50" aria-hidden="true">
              <motion.span
                className={cn("absolute inset-y-0 left-0 rounded-full", tone === "primary" ? "bg-primary-base" : "bg-strong-950")}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.04 * i }}
                style={{ minWidth: d.value > 0 ? 4 : 0 }}
              />
            </span>
            <span className="tabular w-10 text-right text-sub-600 group-hover:text-strong-950">{format(d.value)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Vertical bars (histogram). */
export function BarsV({ data, height = 180 }: { data: Point[]; height?: number }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }} role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          const active = hover === i;
          return (
            <div key={d.label} className="relative flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <span className={cn("tabular pointer-events-none absolute left-1/2 -translate-x-1/2 text-label-xs text-strong-950 transition-opacity", active ? "opacity-100" : "opacity-0")} style={{ bottom: `calc(${h}% + 6px)` }}>
                {d.value}
              </span>
              <motion.div
                className={cn("w-full rounded-t-[4px]", active ? "bg-primary-dark" : "bg-primary-base")}
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${Math.max(h, d.value > 0 ? 2 : 0)}%` }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.05 * i }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-soft-200 pt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[0.6875rem] leading-4 text-sub-600" title={d.label}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Area + line over days, drawn on mount, with a crosshair tooltip. */
export function AreaLine({ data, height = 200 }: { data: DayPoint[]; height?: number }) {
  const reduce = useReducedMotion();
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const padL = 28;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const max = Math.max(2, ...data.map((d) => d.count));
  const x = (i: number) => padL + (i / (data.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const line = useMemo(() => data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(d.count).toFixed(1)}`).join(" "), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const area = `${line} L${x(data.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const ticks = [0, Math.ceil(max / 2), max];
  const label = (d: string) => {
    const dt = new Date(d + "T00:00:00Z");
    return `${dt.getUTCDate()}.${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - padL) / (W - padL - padR)) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };
  const total = data.reduce((a, d) => a + d.count, 0);
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ height }}
        role="img"
        aria-label={`Oxirgi ${data.length} kunda ${total} ta vakansiya eʼlon qilingan`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-primary-base)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--color-primary-base)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--color-soft-200)" strokeWidth="1" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-sub-600)" className="tabular">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => (i % 7 === 0 || i === data.length - 1) && (
          <text key={d.date} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--color-sub-600)">
            {label(d.date)}
          </text>
        ))}
        <motion.path d={area} fill={`url(#${id}-fill)`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--color-primary-base)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--color-sub-300)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].count)} r="5" fill="var(--color-primary-base)" stroke="var(--color-white-0)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div
          className="pointer-events-none absolute top-2 rounded-8 bg-strong-950 px-2.5 py-1.5 text-label-xs text-white-0 shadow-regular-sm"
          style={{ left: `calc(${(x(hover) / W) * 100}% + 8px)`, transform: x(hover) > W * 0.7 ? "translateX(calc(-100% - 16px))" : undefined }}
        >
          {label(data[hover].date)} · <span className="tabular">{data[hover].count}</span> ta
        </div>
      )}
    </div>
  );
}

/** Segmented single bar with a legend — for a breakdown of one total. */
export function Segments({ data }: { data: Point[] }) {
  const reduce = useReducedMotion();
  const total = Math.max(1, data.reduce((a, d) => a + d.value, 0));
  const shades = ["bg-primary-base", "bg-qizil-400", "bg-qizil-300", "bg-qizil-200", "bg-qizil-100"];
  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
        {data.map((d, i) => (
          <motion.span
            key={d.label}
            className={cn("h-full", shades[Math.min(i, shades.length - 1)])}
            initial={reduce ? false : { flexBasis: 0 }}
            animate={{ flexBasis: `${(d.value / total) * 100}%` }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 * i }}
            style={{ flexGrow: 0, flexShrink: 0 }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-label-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[3px]", shades[Math.min(i, shades.length - 1)])} />
            <span className="truncate text-strong-950">{d.label}</span>
            <span className="tabular ml-auto text-sub-600">
              {d.value} <span className="text-soft-400">({Math.round((d.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
