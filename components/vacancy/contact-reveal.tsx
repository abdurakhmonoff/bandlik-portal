"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Phone, PaperPlaneTilt, Copy, Check, User } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { formatPhone, telHref } from "@/lib/format";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the value is selectable text anyway */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? copiedLabel : label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-8 border border-soft-200 bg-white-0 transition-colors duration-150 hover:bg-weak-50 focus-ring",
        copied ? "text-success-base" : "text-sub-600 hover:text-strong-950",
      )}
    >
      {copied ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}

/**
 * "Aloqa maʼlumotlarini koʻrish": reveals the phone and Telegram with copy
 * buttons. It reveals — it never sends anything anywhere.
 * With JavaScript off, the <details> fallback still shows the contact.
 */
export function ContactReveal({
  locale,
  phone,
  telegram,
  contactPerson,
  className,
}: {
  locale: Locale;
  phone: string | null;
  telegram: string | null;
  contactPerson: string | null;
  className?: string;
}) {
  const m = getMessages(locale);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div id="aloqa" className={cn("scroll-mt-28", className)}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="aloqa-panel"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-10 bg-primary-base px-5 text-label-md font-semibold text-white-0 transition-colors duration-150 hover:bg-primary-dark focus-ring sm:w-auto"
        >
          <Phone size={20} aria-hidden="true" />
          {m.detail.showContact}
        </button>
      ) : null}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="aloqa-panel"
            key="panel"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.quick}
            className="rounded-12 border border-soft-200 bg-white-0 p-4 sm:p-5"
          >
            <h3 className="text-label-md font-semibold text-strong-950">{m.detail.contactShown}</h3>
            {contactPerson && (
              <p className="mt-2 inline-flex items-center gap-2 text-paragraph-sm text-sub-600">
                <User size={16} aria-hidden="true" className="text-soft-400" />
                <span>
                  {m.detail.contactPerson}: <span className="text-strong-950">{contactPerson}</span>
                </span>
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3">
              {phone ? (
                <div className="flex items-center gap-2">
                  <a
                    href={telHref(phone)}
                    className="inline-flex h-11 min-w-0 flex-1 items-center gap-3 rounded-8 border border-soft-200 bg-white-0 px-3.5 text-strong-950 transition-colors duration-150 hover:border-sub-300 hover:bg-weak-50 focus-ring"
                  >
                    <Phone size={20} aria-hidden="true" className="shrink-0 text-primary-base" />
                    <span className="font-display tabular truncate text-label-lg font-bold">{formatPhone(phone)}</span>
                    <span className="ml-auto hidden text-label-xs text-sub-600 sm:inline">{m.detail.call}</span>
                  </a>
                  <CopyButton value={formatPhone(phone)} label={m.common.copy} copiedLabel={m.common.copied} />
                </div>
              ) : null}
              {telegram ? (
                <div className="flex items-center gap-2">
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 min-w-0 flex-1 items-center gap-3 rounded-8 border border-soft-200 bg-white-0 px-3.5 text-strong-950 transition-colors duration-150 hover:border-sub-300 hover:bg-weak-50 focus-ring"
                  >
                    <PaperPlaneTilt size={20} aria-hidden="true" className="shrink-0 text-primary-base" />
                    <span className="truncate text-label-md font-medium">{telegram.replace(/^https?:\/\/(t\.me\/)?/, "@")}</span>
                    <span className="ml-auto hidden text-label-xs text-sub-600 sm:inline">{m.detail.writeTelegram}</span>
                  </a>
                  <CopyButton value={telegram} label={m.common.copy} copiedLabel={m.common.copied} />
                </div>
              ) : (
                <p className="text-label-sm text-soft-400">{m.detail.noTelegram}</p>
              )}
            </div>
            <p className="mt-4 text-paragraph-sm text-sub-600">{m.detail.contactHint}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <noscript>
        <details className="mt-3 rounded-12 border border-soft-200 p-4">
          <summary className="cursor-pointer text-label-md font-semibold">{m.detail.showContact}</summary>
          {phone && (
            <p className="tabular mt-2">
              <a href={telHref(phone)}>{formatPhone(phone)}</a>
            </p>
          )}
          {telegram && (
            <p className="mt-1">
              <a href={telegram}>{telegram}</a>
            </p>
          )}
        </details>
      </noscript>
    </div>
  );
}
