"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; match: string };

function isActive(pathname: string, match: string) {
  const p = pathname.startsWith("/ru/") ? pathname.slice(3) : pathname === "/ru" ? "/" : pathname;
  return p === match || p.startsWith(match + "/");
}

export function NavLinks({ items, orientation = "horizontal", onNavigate }: { items: NavItem[]; orientation?: "horizontal" | "vertical"; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={cn("flex", orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1")}>
      {items.map((item) => {
        const active = isActive(pathname, item.match);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex items-center rounded-8 font-medium transition-colors duration-150 focus-ring",
                orientation === "horizontal"
                  ? "h-9 px-3 text-label-sm"
                  : "h-12 w-full px-3 text-label-md",
                active ? "text-strong-950" : "text-sub-600 hover:bg-weak-50 hover:text-strong-950",
              )}
            >
              {item.label}
              {active && orientation === "horizontal" && (
                <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary-base" />
              )}
              {active && orientation === "vertical" && (
                <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary-base" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
