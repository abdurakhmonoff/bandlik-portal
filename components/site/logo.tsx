import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import { localePath } from "@/lib/i18n/config";

/**
 * The mark: a barchan dune profile — gentle windward slope, steep slip face —
 * with a rising line off the crest. Reads as a hill and as growth.
 */
export function Mark({
  className,
  tone = "light",
  size = 32,
}: {
  className?: string;
  /** light = ink line on light background; dark = white line on ink */
  tone?: "light" | "dark";
  size?: number;
}) {
  const line = tone === "dark" ? "var(--color-white-0)" : "var(--color-strong-950)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path d="M2 25.5C10 24.6 16.4 17.4 24.6 9.6V25.5H2Z" fill="var(--color-primary-base)" />
      <path d="M19.5 14.5L28.5 5.5" stroke={line} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="2" y="25.5" width="28" height="2.4" rx="1.2" fill={line} />
    </svg>
  );
}

export function Wordmark({
  tone = "light",
  className,
  size = "md",
}: {
  tone?: "light" | "dark";
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-[1.125rem]", md: "text-[1.375rem]", lg: "text-[1.75rem]" };
  return (
    <span
      className={cn(
        "font-display leading-none tracking-[-0.02em] whitespace-nowrap",
        sizes[size],
        tone === "dark" ? "text-white-0" : "text-strong-950",
        className,
      )}
    >
      <span className="font-bold">Bandlik</span>{" "}
      <span className={cn("font-medium", tone === "dark" ? "text-qizil-300" : "text-primary-base")}>Portal</span>
    </span>
  );
}

export function Logo({
  locale,
  tone = "light",
  size = "md",
  className,
  withDistrict = false,
}: {
  locale: Locale;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  withDistrict?: boolean;
}) {
  const markSize = { sm: 26, md: 32, lg: 40 }[size];
  return (
    <Link
      href={localePath(locale, "/")}
      className={cn("inline-flex items-center gap-2.5 rounded-6 focus-ring", className)}
      aria-label="Bandlik Portal"
    >
      <Mark tone={tone} size={markSize} />
      <span className="flex flex-col">
        <Wordmark tone={tone} size={size} />
        {withDistrict && (
          <span className={cn("text-label-xs mt-1", tone === "dark" ? "text-tepa-300" : "text-sub-600")}>
            {locale === "ru" ? "Кызылтепинский район" : "Qiziltepa tumani"}
          </span>
        )}
      </span>
    </Link>
  );
}
