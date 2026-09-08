/**
 * Motion language: things rise, like the hill.
 * Springs for anything that moves in space, ease-out for opacity.
 */
import type { Transition, Variants } from "motion/react";

export const spring = {
  /** UI response: chips, toggles, reveals */
  quick: { type: "spring", stiffness: 520, damping: 38, mass: 0.8 } as Transition,
  /** Panels, sheets, the assistant */
  panel: { type: "spring", stiffness: 420, damping: 32, mass: 1 } as Transition,
  /** Proactive bubbles */
  bubble: { type: "spring", stiffness: 420, damping: 32 } as Transition,
  /** The hero's orchestrated entrance */
  hero: { type: "spring", stiffness: 260, damping: 30, mass: 1 } as Transition,
};

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  fast: 0.15,
  base: 0.2,
  slow: 0.25,
  moment: 0.45,
  momentLong: 0.6,
};

/** Rise from the baseline. Used by the hero and by user-triggered reveals. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring.hero, delay: 0.06 * i },
  }),
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
};

export const reducedMotionTransition: Transition = { duration: 0 };
