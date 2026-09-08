"use client";

import { useRouter } from "next/navigation";
import { GooeyNav } from "@/components/rare/gooey-nav";
import type { Locale, Sector } from "@/types";
import { localePath } from "@/lib/i18n/config";

/**
 * Sector strip using Rare UI's gooey nav. Items are real links so the strip
 * works without JavaScript; with it, the active blob follows the selection
 * and the router navigates.
 */
export function SectorsNav({
  sectors,
  counts,
  locale,
  activeId,
  allLabel,
  allHref,
}: {
  sectors: Sector[];
  counts: Record<string, number>;
  locale: Locale;
  activeId?: string;
  allLabel?: string;
  allHref?: string;
}) {
  const router = useRouter();
  const items = [
    ...(allLabel && allHref ? [{ label: allLabel, href: allHref }] : []),
    ...sectors.map((s) => ({
      label: `${s.shortName[locale]} ${counts[s.id] ?? 0}`,
      href: localePath(locale, `/sohalar/${s.slug}`),
    })),
  ];
  const offset = allLabel ? 1 : 0;
  const activeIndex = activeId ? sectors.findIndex((s) => s.id === activeId) + offset : 0;
  return (
    <GooeyNav
      items={items}
      value={Math.max(0, activeIndex)}
      onChange={(i) => {
        const href = items[i]?.href;
        if (href) router.push(href);
      }}
      size="md"
      aria-label={locale === "ru" ? "Отрасли" : "Sohalar"}
    />
  );
}
