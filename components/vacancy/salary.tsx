import type { Locale, Vacancy } from "@/types";
import { formatSalary } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The salary is the loudest number on the page: Bricolage, tabular,
 * right-aligned so a list reads down like a register.
 */
export function Salary({
  vacancy,
  locale,
  size = "md",
  align = "right",
  compact = false,
  className,
}: {
  vacancy: Pick<Vacancy, "salaryMin" | "salaryMax" | "salaryNegotiable" | "paymentType">;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  compact?: boolean;
  className?: string;
}) {
  const s = formatSalary(vacancy, locale, compact);
  const figure = {
    sm: "text-[1rem] leading-6",
    md: "text-[1.125rem] leading-6 sm:text-[1.25rem] sm:leading-7",
    lg: "text-title-h5 sm:text-title-h4",
  }[size];
  return (
    <div className={cn("flex flex-col", align === "right" ? "items-end text-right" : "items-start text-left", className)}>
      <span
        className={cn(
          "font-display tabular font-bold tracking-[-0.01em] whitespace-nowrap",
          figure,
          s.negotiable ? "text-sub-600 font-medium" : "text-strong-950",
        )}
      >
        {s.value}
      </span>
      {s.unit && <span className="text-label-xs text-sub-600">{s.unit}</span>}
    </div>
  );
}
