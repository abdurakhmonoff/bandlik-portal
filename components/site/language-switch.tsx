"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/types";
import { localePath, localeShort } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function stripLocale(pathname: string): string {
  if (pathname === "/ru") return "/";
  if (pathname.startsWith("/ru/")) return pathname.slice(3);
  return pathname;
}

function Switch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const base = stripLocale(pathname);
  const qs = search.toString();
  const items: Locale[] = ["uz", "ru"];
  return (
    <nav aria-label={locale === "ru" ? "Язык" : "Til"} className="flex items-center gap-0.5">
      {items.map((l) => {
        const active = l === locale;
        const href = localePath(l, base) + (qs ? `?${qs}` : "");
        return (
          <Link
            key={l}
            href={href}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex h-6 min-w-8 items-center justify-center rounded-4 px-1.5 text-label-xs font-medium focus-ring transition-colors duration-150",
              active ? "bg-strong-950 text-white-0" : "text-sub-600 hover:bg-sand-stroke hover:text-strong-950",
            )}
          >
            {localeShort[l]}
          </Link>
        );
      })}
    </nav>
  );
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  // useSearchParams needs a Suspense boundary for static rendering
  return (
    <Suspense fallback={<span className="inline-block h-6 w-16" aria-hidden="true" />}>
      <Switch locale={locale} />
    </Suspense>
  );
}
