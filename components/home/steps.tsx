"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { StepPlayer } from "@/components/rare/step-player";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

/**
 * "Qanday ish topaman?" — a genuine sequence, so numbering is legitimate.
 * The Rare UI step player drives which step is highlighted; the player only
 * runs when the user presses play.
 */
export function HowToSteps({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  const steps = m.home.steps;
  const labels =
    locale === "ru"
      ? { play: "Показать шаги", pause: "Пауза", replay: "Ещё раз" }
      : { play: "Qadamlarni koʻrsatish", pause: "Toʻxtatish", replay: "Qayta koʻrish" };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <StepPlayer
          steps={steps.map((s) => ({ label: s.title, duration: 2600 }))}
          value={value}
          onValueChange={setValue}
          size={44}
          loop={false}
          labels={labels}
          className="w-full"
        />
        <div className="mt-6 hidden lg:block" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={value}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={spring.quick}
              className="text-paragraph-lg text-strong-950"
            >
              {steps[value]?.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-1">
        {steps.map((s, i) => {
          const active = i === value;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setValue(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-4 rounded-12 border p-4 text-left transition-colors duration-150 focus-ring",
                  active ? "border-strong-950 bg-white-0" : "border-soft-200 bg-white-0 hover:border-sub-300",
                )}
              >
                <span
                  className={cn(
                    "font-display tabular inline-flex size-9 shrink-0 items-center justify-center rounded-full text-label-md font-bold transition-colors duration-150",
                    active ? "bg-primary-base text-white-0" : "bg-sand-base text-strong-950",
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-label-md font-semibold text-strong-950">{s.title}</span>
                  <span className="mt-1 block text-paragraph-sm text-sub-600">{s.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
