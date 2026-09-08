"use client";

import Link from "next/link";
import { MapPin } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import type { AssistantVacancyCard } from "@/lib/assistant/types";
import { localePath } from "@/lib/i18n/config";
import { formatSalary } from "@/lib/format";
import { getMessages } from "@/lib/i18n/messages";

/** A real vacancy card inside the chat — links to the detail page. */
export function MiniCard({ card, locale, onNavigate }: { card: AssistantVacancyCard; locale: Locale; onNavigate?: () => void }) {
  const m = getMessages(locale);
  const s = formatSalary(card, locale, true);
  return (
    <Link
      href={localePath(locale, `/vakansiyalar/${card.slug}`)}
      onClick={onNavigate}
      className="block rounded-12 border border-soft-200 bg-white-0 p-3 transition-colors duration-150 hover:border-sub-300 hover:bg-qum-50 focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm font-semibold leading-5 text-strong-950">{card.title}</p>
          {card.organization && <p className="mt-0.5 truncate text-label-xs text-sub-600">{card.organization}</p>}
          <p className="mt-1.5 inline-flex items-center gap-1 text-label-xs text-sub-600">
            <MapPin size={14} aria-hidden="true" className="text-soft-400" />
            {card.mahalla ?? m.card.noMahalla}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className={s.negotiable ? "text-label-xs font-medium text-sub-600" : "font-display tabular text-label-md font-bold text-strong-950"}>
            {s.value}
          </span>
          {s.unit && <span className="block text-[0.6875rem] leading-4 text-sub-600">{s.unit}</span>}
        </div>
      </div>
    </Link>
  );
}
