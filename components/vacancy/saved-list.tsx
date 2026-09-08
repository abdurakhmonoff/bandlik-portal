"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import type { AssistantVacancyCard } from "@/lib/assistant/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { useSavedIds, removeSaved, clearSaved } from "@/lib/saved";
import { MiniCard } from "@/components/ai-assistant/mini-card";
import { HillIllustration } from "@/components/site/hill";
import { Skeleton } from "@/components/ui/skeleton";

/** The localStorage-backed saved list. Ids live on the device; cards are resolved on request. */
export function SavedList({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const ids = useSavedIds();
  const [cards, setCards] = useState<AssistantVacancyCard[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const key = ids.join(",");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!key) {
      setCards([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/saqlangan?locale=${locale}&ids=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { cards: AssistantVacancyCard[] }) => {
        if (!cancelled) setCards(data.cards);
      })
      .catch(() => {
        if (!cancelled) setCards([]);
      });
    return () => {
      cancelled = true;
    };
  }, [key, locale, mounted]);

  if (!mounted || cards === null) {
    return (
      <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
        {Array.from({ length: Math.max(2, Math.min(ids.length, 6)) }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-12" />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <HillIllustration className="mb-6 max-w-[14rem]" />
        <h2 className="text-title-h5">{m.saved.emptyTitle}</h2>
        <p className="mt-2 text-paragraph-md text-sub-600">{m.saved.emptyLead}</p>
        <Link href={localePath(locale, "/vakansiyalar")} className="mt-6 inline-flex h-11 items-center rounded-8 bg-primary-base px-4 text-label-md font-semibold text-white-0 hover:bg-primary-dark focus-ring">
          {m.saved.goToList}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="tabular text-label-md font-semibold text-strong-950" aria-live="polite">
          {m.saved.count(cards.length)}
        </p>
        <button type="button" onClick={clearSaved} className="text-label-sm text-sub-600 underline-offset-4 hover:text-strong-950 hover:underline focus-ring rounded-4">
          {m.saved.clearAll}
        </button>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.id} className="relative">
            <MiniCard card={c} locale={locale} />
            <button
              type="button"
              onClick={() => removeSaved(c.id)}
              aria-label={m.card.unsaveAria(c.title)}
              className="absolute -right-2 -top-2 inline-flex size-8 items-center justify-center rounded-full bg-white-0 text-sub-600 shadow-regular-sm ring-1 ring-soft-200 hover:text-strong-950 focus-ring"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
