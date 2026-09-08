import * as React from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

export type PaginationSize = "small" | "medium";

export type PaginationLabels = {
  previous: string;
  next: string;
  /** Word for a single page, e.g. "Sahifa". */
  page: string;
  /** Word joining page and total, e.g. "dan". */
  of: string;
};

export type PaginationProps = Omit<React.ComponentProps<"nav">, "children"> & {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  labels: PaginationLabels;
  size?: PaginationSize;
  /** Accessible name of the nav; falls back to `labels.page`. */
  ariaLabel?: string;
};

const CELL_SIZE: Record<PaginationSize, string> = {
  small: "h-9 min-w-9",
  medium: "h-10 min-w-10",
};

const cellClasses = [
  "inline-flex items-center justify-center rounded-8 border border-transparent px-2",
  "text-label-sm font-medium outline-none transition-colors duration-150 focus-ring",
];

/** At most five numbered pages, with ellipses standing in for the rest. */
function buildPages(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, Math.min(page - 1, totalPages - 3));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 4));

  if (start > 2) items.push("ellipsis");
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

function Pagination({
  className,
  page,
  totalPages,
  hrefFor,
  labels,
  size = "medium",
  ariaLabel,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(page, 1), totalPages);
  const pages = buildPages(current, totalPages);
  const hasPrevious = current > 1;
  const hasNext = current < totalPages;

  return (
    <nav
      data-slot="pagination"
      aria-label={ariaLabel ?? labels.page}
      className={cn("flex w-full items-center justify-center", className)}
      {...props}
    >
      <p className="sr-only">
        {labels.page} {current} {labels.of} {totalPages}
      </p>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {hasPrevious ? (
            <Link
              href={hrefFor(current - 1)}
              rel="prev"
              aria-label={labels.previous}
              className={cn(
                cellClasses,
                CELL_SIZE[size],
                "gap-1 border-soft-200 bg-white-0 text-strong-950 hover:bg-weak-50",
              )}
            >
              <CaretLeft size={16} weight="regular" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:pr-1">{labels.previous}</span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              aria-label={labels.previous}
              className={cn(
                cellClasses,
                CELL_SIZE[size],
                "gap-1 cursor-not-allowed bg-weak-50 text-disabled-300",
              )}
            >
              <CaretLeft size={16} weight="regular" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:pr-1">{labels.previous}</span>
            </span>
          )}
        </li>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`} aria-hidden="true">
              <span
                className={cn(
                  "inline-flex items-center justify-center text-label-sm text-soft-400",
                  CELL_SIZE[size],
                )}
              >
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              {item === current ? (
                <span
                  aria-current="page"
                  aria-label={`${labels.page} ${item}`}
                  className={cn(
                    cellClasses,
                    CELL_SIZE[size],
                    "tabular bg-strong-950 text-static-white",
                  )}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={hrefFor(item)}
                  aria-label={`${labels.page} ${item}`}
                  className={cn(
                    cellClasses,
                    CELL_SIZE[size],
                    "tabular text-sub-600 hover:bg-weak-50 hover:text-strong-950",
                  )}
                >
                  {item}
                </Link>
              )}
            </li>
          ),
        )}

        <li>
          {hasNext ? (
            <Link
              href={hrefFor(current + 1)}
              rel="next"
              aria-label={labels.next}
              className={cn(
                cellClasses,
                CELL_SIZE[size],
                "gap-1 border-soft-200 bg-white-0 text-strong-950 hover:bg-weak-50",
              )}
            >
              <span className="sr-only sm:not-sr-only sm:pl-1">{labels.next}</span>
              <CaretRight size={16} weight="regular" aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              aria-label={labels.next}
              className={cn(
                cellClasses,
                CELL_SIZE[size],
                "gap-1 cursor-not-allowed bg-weak-50 text-disabled-300",
              )}
            >
              <span className="sr-only sm:not-sr-only sm:pl-1">{labels.next}</span>
              <CaretRight size={16} weight="regular" aria-hidden="true" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

export { Pagination };
