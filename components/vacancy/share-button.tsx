"use client";

import { useState } from "react";
import { ShareNetwork, Check } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

/** Native share where available, otherwise copies the link. */
export function ShareButton({ locale, title, url, className }: { locale: Locale; title: string; url: string; className?: string }) {
  const m = getMessages(locale);
  const [done, setDone] = useState(false);
  const share = async () => {
    const absolute = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
    try {
      const nav: Navigator = navigator;
      if (typeof nav.share === "function") {
        await nav.share({ title, url: absolute });
        return;
      }
      await nav.clipboard.writeText(absolute);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      /* user cancelled or clipboard blocked */
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-label={done ? m.detail.shareCopied : m.common.share}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-8 border border-soft-200 bg-white-0 transition-colors duration-150 hover:bg-weak-50 focus-ring",
        done ? "text-success-base" : "text-sub-600 hover:text-strong-950",
        className,
      )}
    >
      {done ? <Check size={20} aria-hidden="true" /> : <ShareNetwork size={20} aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {done ? m.detail.shareCopied : ""}
      </span>
    </button>
  );
}
