"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { rise } from "@/lib/motion";

/**
 * The one orchestrated, non-user-triggered sequence on the home page.
 * Title, lead, search and chips rise from the baseline in turn. Reduced
 * motion renders everything in place.
 */
export function HeroEntrance({
  title,
  lead,
  search,
  chips,
}: {
  title: ReactNode;
  lead: ReactNode;
  search: ReactNode;
  chips: ReactNode;
}) {
  const reduce = useReducedMotion();
  const initial = reduce ? false : "hidden";
  return (
    <motion.div initial={initial} animate="visible" className="relative mx-auto max-w-3xl">
      <motion.div variants={rise} custom={0}>
        {title}
      </motion.div>
      <motion.div variants={rise} custom={1}>
        {lead}
      </motion.div>
      <motion.div variants={rise} custom={2} className="mt-8">
        {search}
      </motion.div>
      <motion.div variants={rise} custom={3} className="mt-5">
        {chips}
      </motion.div>
    </motion.div>
  );
}
