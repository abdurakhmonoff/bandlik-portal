"use client";

import Link from "next/link";
import { BookmarkSimple } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import { localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { useSavedIds } from "@/lib/saved";
import { NotificationBell } from "@/components/rare/notification-bell";

/** Header counter for saved vacancies, driven by localStorage. */
export function SavedBell({ locale }: { locale: Locale }) {
  const ids = useSavedIds();
  const m = getMessages(locale);
  return (
    <NotificationBell
      count={ids.length}
      size={40}
      color="red"
      icon={<BookmarkSimple size={20} weight="regular" aria-hidden="true" />}
      asChild
    >
      <Link
        href={localePath(locale, "/saqlangan")}
        aria-label={`${m.nav.savedAria}${ids.length ? `: ${ids.length}` : ""}`}
        className="focus-ring rounded-8"
      />
    </NotificationBell>
  );
}
