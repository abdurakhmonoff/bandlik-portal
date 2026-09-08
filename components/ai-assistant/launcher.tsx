"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FluidOrb } from "@/components/rare/fluid-orb";
import { cn } from "@/lib/utils";

/**
 * The launcher badge. 56px desktop / 52px mobile, bottom-right, the fluid
 * orb inside. Idle: a 4s breathing scale on the inner disc and a soft aura.
 * Hover: the ring expands and a label pill slides out to the left.
 * The badge stays mounted while the panel is open (hidden, inert) so the
 * open/close transition never re-mounts it.
 */
export const Launcher = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    onlineLabel: string;
    unread: boolean;
    unreadLabel: string;
    onClick: () => void;
    hidden?: boolean;
  }
>(function Launcher({ label, onlineLabel, unread, unreadLabel, onClick, hidden = false }, ref) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(true);

  // pause the WebGL loop when the tab is hidden or the badge is not shown
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-3 print-hidden transition-opacity duration-200 ease-out",
        "right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6",
        hidden && "pointer-events-none opacity-0",
      )}
      aria-hidden={hidden || undefined}
    >
      {/* label pill, slides out on hover / focus */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={hover && !hidden ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
        className="pointer-events-none hidden rounded-full bg-strong-950 px-3 py-1.5 text-label-xs font-medium text-white-0 shadow-regular-sm sm:block"
      >
        {label}
      </motion.span>

      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={label}
        aria-haspopup="dialog"
        tabIndex={hidden ? -1 : 0}
        className="relative flex size-[52px] items-center justify-center rounded-full focus-ring sm:size-14"
      >
        {/* aura ring */}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={hover ? { scale: 1.3, opacity: 0.35 } : { scale: 1.12, opacity: 0.16 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
          className="absolute inset-0 rounded-full bg-primary-base"
        />
        {/* breathing disc */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-white-0 shadow-regular-md ring-1 ring-soft-200"
          animate={reduce || hover || hidden ? { scale: 1 } : { scale: [1, 1.04, 1] }}
          transition={reduce || hover || hidden ? { duration: 0.15 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative size-[38px] overflow-hidden rounded-full sm:size-[42px]">
          <FluidOrb size={42} paused={!visible || hidden} className="size-full" />
        </span>
        {/* online dot */}
        <span className="absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-white-0 bg-success-base" title={onlineLabel}>
          <span className="sr-only">{onlineLabel}</span>
        </span>
        {/* unread dot with a single ping */}
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center" aria-hidden="true">
            {!reduce && <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-base opacity-60 [animation-iteration-count:1]" />}
            <span className="relative inline-flex size-2.5 rounded-full border-2 border-white-0 bg-primary-base" />
            <span className="sr-only">{unreadLabel}</span>
          </span>
        )}
      </button>
    </div>
  );
});
