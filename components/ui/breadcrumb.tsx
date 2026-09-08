import * as React from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: BreadcrumbItem[];
  /** Accessible name of the trail, e.g. "Sahifa yo'li". */
  ariaLabel: string;
};

function Breadcrumb({ className, items, ariaLabel, ...props }: BreadcrumbProps) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-label-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-1.5">
              {index > 0 ? (
                <CaretRight
                  size={14}
                  weight="regular"
                  aria-hidden="true"
                  className="shrink-0 text-soft-400"
                />
              ) : null}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="max-w-[14rem] truncate text-strong-950"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "max-w-[14rem] truncate rounded-4 text-sub-600 outline-none",
                    "transition-colors duration-150 focus-ring hover:text-strong-950",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb };
