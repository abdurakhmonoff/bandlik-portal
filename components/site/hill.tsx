import { cn } from "@/lib/utils";

/**
 * The hill arc — the site's one recurring structural device.
 * One asymmetric curve rising left → right. Used as the hero's bottom edge,
 * as a section transition, as the empty-state illustration and as the
 * loading shape. Everything else on the site stays rectilinear.
 */

export const HILL_PATH = "M0 120L0 104C240 96 520 72 860 34C1080 10 1300 4 1440 20L1440 120Z";
/** The same crest as a stroke-only line (no fill), for hairline dividers. */
export const HILL_LINE = "M0 104C240 96 520 72 860 34C1080 10 1300 4 1440 20";

type Fill = "sand" | "ink" | "primary" | "white" | "sand-light";

const fills: Record<Fill, string> = {
  sand: "fill-sand-base",
  "sand-light": "fill-sand-light",
  ink: "fill-strong-950",
  primary: "fill-primary-base",
  white: "fill-white-0",
};

/**
 * Section transition: a filled hill whose colour is the NEXT section's
 * background, so the band below appears to rise into the one above.
 */
export function HillEdge({
  fill = "sand",
  className,
  height = 96,
  flip = false,
}: {
  fill?: Fill;
  className?: string;
  height?: number;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("block w-full", flip && "-scale-x-100", className)}
      style={{ height }}
    >
      <path d={HILL_PATH} className={fills[fill]} />
    </svg>
  );
}

/** A hairline crest, used under section titles and in the assistant header. */
export function HillLine({ className, stroke = "stroke-sand-stroke" }: { className?: string; stroke?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-6 w-full", className)}
    >
      <path d={HILL_LINE} fill="none" strokeWidth="3" vectorEffect="non-scaling-stroke" className={stroke} />
    </svg>
  );
}

/**
 * The empty-state / not-found illustration: the dune mark, large, with a
 * dotted search path climbing it.
 */
export function HillIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 160"
      aria-hidden="true"
      focusable="false"
      className={cn("mx-auto block w-full max-w-[20rem]", className)}
    >
      <path d="M16 132C86 126 160 78 246 40V132H16Z" className="fill-sand-base" />
      <path d="M16 132C86 126 160 78 246 40" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-primary-base" />
      <path d="M200 66L270 14" strokeWidth="4" strokeLinecap="round" className="stroke-strong-950" />
      <path
        d="M40 122 C 90 118, 130 100, 170 84"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 8"
        className="stroke-sub-600"
      />
      <rect x="16" y="132" width="288" height="4" rx="2" className="fill-strong-950" />
    </svg>
  );
}

/** Loading shape: a shimmering hill used by list skeletons while data is pending. */
export function HillSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton hill-mask h-16 w-full max-w-[16rem]", className)} aria-hidden="true" />
  );
}
