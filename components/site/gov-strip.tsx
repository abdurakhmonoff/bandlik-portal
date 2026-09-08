import Link from "next/link";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { hokimlik } from "@/data/organization";
import { LanguageSwitch } from "@/components/site/language-switch";

/** Thin government-identification strip above the header. */
export function GovStrip({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <div className="bg-sand-base text-strong-950 print-hidden">
      <div className="site-container flex h-8 items-center justify-between gap-4 text-label-xs">
        <p className="flex min-w-0 items-center gap-2 truncate">
          <span aria-hidden="true" className="inline-block size-2 shrink-0 rounded-[2px] bg-primary-base" />
          <span className="truncate">{m.site.govStrip}</span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={localePath(locale, "/aloqa")}
            className="hidden text-sub-600 hover:text-strong-950 sm:inline focus-ring rounded-4"
          >
            {hokimlik.shortName[locale]}
          </Link>
          <LanguageSwitch locale={locale} />
        </div>
      </div>
    </div>
  );
}
