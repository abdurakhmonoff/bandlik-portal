"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { NavLinks, type NavItem } from "@/components/site/nav-links";
import { LanguageSwitch } from "@/components/site/language-switch";

export function MobileMenu({ locale, items }: { locale: Locale; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const m = getMessages(locale);
  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <IconButton variant="neutral" mode="ghost" size="medium" aria-label={m.nav.menu} aria-expanded={open}>
            <List size={24} aria-hidden="true" />
          </IconButton>
        </SheetTrigger>
        <SheetContent side="right" closeLabel={m.nav.close} showClose={false}>
          <div className="flex items-center justify-between">
            <Logo locale={locale} />
            <IconButton variant="neutral" mode="ghost" size="medium" aria-label={m.nav.close} onClick={() => setOpen(false)}>
              <X size={24} aria-hidden="true" />
            </IconButton>
          </div>
          <SheetTitle className="sr-only">{m.nav.menu}</SheetTitle>
          <nav aria-label={m.nav.menu} className="mt-6">
            <NavLinks items={items} orientation="vertical" onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-6 flex flex-col gap-3 border-t border-soft-200 pt-6">
            <Link
              href={localePath(locale, "/vakansiyalar")}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-8 bg-primary-base px-4 text-label-md font-medium text-white-0 hover:bg-primary-dark focus-ring"
            >
              {m.nav.findJob}
            </Link>
            <Link
              href={localePath(locale, "/saqlangan")}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-8 border border-soft-200 px-4 text-label-md font-medium text-strong-950 hover:bg-weak-50 focus-ring"
            >
              {m.nav.saved}
            </Link>
            <div className="flex items-center justify-between pt-2 text-label-sm text-sub-600">
              <span>{m.nav.language}</span>
              <LanguageSwitch locale={locale} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
