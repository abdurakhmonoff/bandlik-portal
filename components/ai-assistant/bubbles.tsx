"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { spring } from "@/lib/motion";

/**
 * Proactive message bubbles rising from the badge. Two, staggered ~600ms,
 * scale 0.85 → 1, y +14 → 0, spring (420/32), each with a tail pointing at
 * the badge. Text blurs in. Never shown under reduced motion.
 */
export function Bubbles({
  items,
  open,
  onOpen,
  onDismiss,
  dismissLabel,
}: {
  items: string[];
  open: boolean;
  onOpen: () => void;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-2 print-hidden right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom)+68px)] sm:right-6 sm:bottom-[calc(5.5rem+72px)]"
      aria-live="polite"
    >
      <AnimatePresence>
        {open &&
          items.map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.85, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { ...spring.bubble, delay: i * 0.6 } }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.25, ease: "easeOut" } }}
              style={{ transformOrigin: "bottom right" }}
              className="relative max-w-[17rem] rounded-16 rounded-br-[6px] bg-white-0 px-4 py-3 text-paragraph-sm text-strong-950 shadow-regular-md ring-1 ring-soft-200"
            >
              <button
                type="button"
                onClick={onOpen}
                className="block text-left focus-ring rounded-6"
              >
                <motion.span
                  initial={{ filter: "blur(6px)", opacity: 0 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.6 + 0.15, ease: "easeOut" }}
                  className="block"
                >
                  {text}
                </motion.span>
              </button>
              {i === 0 && (
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label={dismissLabel}
                  className="absolute -left-2 -top-2 inline-flex size-6 items-center justify-center rounded-full bg-white-0 text-sub-600 shadow-regular-sm ring-1 ring-soft-200 hover:text-strong-950 focus-ring"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              )}
              {i === items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1.5 right-4 size-3 rotate-45 bg-white-0 ring-1 ring-soft-200 [clip-path:polygon(0_100%,100%_0,100%_100%)]"
                />
              )}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
