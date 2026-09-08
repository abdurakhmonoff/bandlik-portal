"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { signOut } from "@/lib/admin/auth";
import { Mark, Wordmark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Koʻrsatkichlar" },
  { href: "/admin/vakansiyalar", label: "Vakansiyalar" },
];

/** Admin chrome: brand, section nav, view-site and sign-out. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-sand-light">
      <header className="sticky top-0 z-30 border-b border-soft-200 bg-white-0/95 backdrop-blur">
        <div className="site-container flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex items-center gap-2 focus-ring rounded-6" aria-label="Saytga qaytish">
              <Mark size={26} />
              <Wordmark size="sm" className="hidden sm:inline" />
            </Link>
            <span aria-hidden="true" className="h-5 w-px bg-soft-200" />
            <nav aria-label="Boshqaruv boʻlimlari">
              <ul className="flex items-center gap-1">
                {NAV.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative inline-flex h-9 items-center rounded-8 px-3 text-label-sm font-medium transition-colors duration-150 focus-ring",
                          active ? "bg-sand-base text-strong-950" : "text-sub-600 hover:bg-weak-50 hover:text-strong-950",
                        )}
                      >
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden h-9 items-center rounded-8 px-3 text-label-sm font-medium text-sub-600 hover:bg-weak-50 hover:text-strong-950 focus-ring sm:inline-flex">
              Saytni koʻrish
            </Link>
            <button
              type="button"
              onClick={() => {
                signOut();
                window.location.reload();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-8 border border-soft-200 px-3 text-label-sm font-medium text-strong-950 hover:bg-weak-50 focus-ring"
            >
              <SignOut size={16} aria-hidden="true" />
              Chiqish
            </button>
          </div>
        </div>
      </header>
      <main className="site-container py-8">{children}</main>
    </div>
  );
}
