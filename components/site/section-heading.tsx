import Link from "next/link";
import { cn } from "@/lib/utils";

/** Section title with an optional lead and a plain-text action link. No eyebrows, no arrows. */
export function SectionHeading({
  id,
  title,
  lead,
  action,
  className,
  as: Tag = "h2",
}: {
  id: string;
  title: string;
  lead?: string;
  action?: { href: string; label: string };
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <Tag id={id} className="text-title-h4 sm:text-title-h3">
          {title}
        </Tag>
        {lead && <p className="mt-2 text-paragraph-md text-sub-600">{lead}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-10 shrink-0 items-center rounded-8 border border-soft-200 bg-white-0 px-3.5 text-label-sm font-medium text-strong-950 transition-colors duration-150 hover:border-sub-300 hover:bg-weak-50 focus-ring"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
