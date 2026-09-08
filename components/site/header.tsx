import Link from "next/link";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { Logo } from "@/components/site/logo";
import { SavedBell } from "@/components/site/saved-bell";
import { MobileMenu } from "@/components/site/mobile-menu";
import { NavLinks } from "@/components/site/nav-links";

export function primaryNav(locale: Locale) {
  const m = getMessages(locale);
  return [
    { href: localePath(locale, "/vakansiyalar"), label: m.nav.vacancies, match: "/vakansiyalar" },
    { href: localePath(locale, "/tashkilotlar"), label: m.nav.organizations, match: "/tashkilotlar" },
    { href: localePath(locale, "/tuman"), label: m.nav.district, match: "/tuman" },
    { href: localePath(locale, "/yordam"), label: m.nav.help, match: "/yordam" },
    { href: localePath(locale, "/aloqa"), label: m.nav.contact, match: "/aloqa" },
  ];
}

export function Header({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const nav = primaryNav(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-soft-200 bg-white-0/95 backdrop-blur supports-[backdrop-filter]:bg-white-0/85 print-hidden">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <Logo locale={locale} />
        <nav aria-label={m.nav.menu} className="hidden lg:block">
          <NavLinks items={nav} />
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={localePath(locale, "/vakansiyalar")}
            className="hidden h-9 items-center rounded-8 bg-primary-base px-3.5 text-label-sm font-medium text-white-0 transition-colors duration-150 hover:bg-primary-dark focus-ring sm:inline-flex"
          >
            {m.nav.findJob}
          </Link>
          <SavedBell locale={locale} />
          <MobileMenu locale={locale} items={nav} />
        </div>
      </div>
    </header>
  );
}
