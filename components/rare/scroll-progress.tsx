// Adapted from Rare UI (rareui.com) — restyled to Bandlik Portal tokens.
"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

// The registry component shipped a floating section-label pill on top of the
// progress line. The portal only needs the line, so the pill — and with it the
// `sections` / `offset` props and the `ScrollProgressSection` type — is gone.
// See components/rare/README.md.

const SPRING = { stiffness: 120, damping: 30, mass: 0.3 } as const;

// how often aria-valuenow is allowed to change, in ms
const ANNOUNCE_EVERY = 100;

export type ScrollProgressProps = Omit<
  React.ComponentProps<"div">,
  "children" | "role"
> & {
  /** Scroll a container instead of the window. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Accessible name for the progressbar. */
  label?: string;
};

const ScrollProgress = ({
  className,
  containerRef,
  label = "Sahifani o‘qish jarayoni",
  ...props
}: ScrollProgressProps) => {
  const reduceMotion = useReducedMotion();
  const barRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined,
  );
  const smoothed = useSpring(scrollYProgress, SPRING);
  // a spring on a value that is already pinned to the scroll position only
  // adds lag for someone who asked for less movement
  const progress = reduceMotion ? scrollYProgress : smoothed;

  React.useEffect(() => {
    const node = barRef.current;
    if (!node) return;

    let last = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const write = (value: number) => {
      last = Date.now();
      const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
      node.setAttribute("aria-valuenow", String(percent));
    };

    // leading edge now, then at most one write per ANNOUNCE_EVERY
    write(progress.get());

    const unsubscribe = progress.on("change", (value: number) => {
      if (timer !== undefined) return;
      const wait = ANNOUNCE_EVERY - (Date.now() - last);
      if (wait <= 0) {
        write(value);
        return;
      }
      timer = setTimeout(() => {
        timer = undefined;
        write(progress.get());
      }, wait);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [progress]);

  return (
    <div
      ref={barRef}
      data-slot="scroll-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 print:hidden",
        className,
      )}
      {...props}
    >
      <motion.div
        data-slot="scroll-progress-bar"
        className="h-full w-full origin-left bg-primary-base"
        style={{ scaleX: progress }}
      />
    </div>
  );
};

export { ScrollProgress };
export default ScrollProgress;
