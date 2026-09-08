"use client";

import { BookmarkSimple } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useSaved } from "@/lib/saved";
import { useMessages } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

/**
 * Bookmark toggle. Stores the vacancy id in localStorage. The icon fills red
 * and gives one small spring on save — motion answers an action.
 */
export function SaveButton({
  id,
  title,
  size = "medium",
  className,
}: {
  id: string;
  title: string;
  size?: "small" | "medium";
  className?: string;
}) {
  const { saved, toggle } = useSaved(id);
  const m = useMessages();
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? m.card.unsaveAria(title) : m.card.saveAria(title)}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-8 transition-colors duration-150 focus-ring",
        size === "small" ? "size-9" : "size-10",
        saved ? "text-primary-base hover:bg-primary-alpha-10" : "text-sub-600 hover:bg-weak-50 hover:text-strong-950",
        className,
      )}
    >
      <motion.span
        key={saved ? "on" : "off"}
        initial={reduce ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={spring.quick}
        className="inline-flex"
      >
        <BookmarkSimple size={size === "small" ? 20 : 24} weight="regular" aria-hidden="true" />
        {saved && (
          <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary-base" />
        )}
      </motion.span>
    </button>
  );
}
