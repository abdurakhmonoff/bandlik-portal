"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { DotsThree, Minus, PaperPlaneRight, X, Trash } from "@phosphor-icons/react";
import type { Locale } from "@/types";
import type { ChatMessage } from "@/lib/assistant/types";
import { getMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { FluidOrb } from "@/components/rare/fluid-orb";
import { HillLine } from "@/components/site/hill";
import { MiniCard } from "@/components/ai-assistant/mini-card";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function Time({ at, locale }: { at: number; locale: Locale }) {
  const s = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "uz-Latn-UZ", { hour: "2-digit", minute: "2-digit" }).format(at);
  return <time dateTime={new Date(at).toISOString()} className="text-[0.6875rem] text-soft-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{s}</time>;
}

export function Panel({
  locale,
  messages,
  pending,
  onSend,
  onClear,
  onClose,
  onMinimize,
  welcomeChips,
  isMobile,
}: {
  locale: Locale;
  messages: ChatMessage[];
  pending: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
  onMinimize: () => void;
  welcomeChips: string[];
  isMobile: boolean;
}) {
  const m = getMessages(locale).assistant;
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // focus the composer on open; trap focus inside; Esc closes
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // keep the newest message in view
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  // auto-size the composer
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = `${Math.min(ta.scrollHeight, 132)}px`;
  }, [draft]);

  const submit = () => {
    const text = draft.trim();
    if (!text || pending) return;
    onSend(text);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (isMobile && (info.offset.y > 120 || info.velocity.y > 600)) onClose();
  };

  const showWelcome = messages.length === 0;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={m.name}
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.12, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.12, y: 24, transition: { duration: 0.2, ease: "easeIn" } }}
      transition={spring.panel}
      style={{ transformOrigin: isMobile ? "50% 100%" : "calc(100% - 28px) calc(100% - 28px)" }}
      drag={isMobile && !reduce ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      onDragEnd={onDragEnd}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden bg-white-0 shadow-regular-md ring-1 ring-soft-200 print-hidden",
        isMobile
          ? "inset-x-0 bottom-0 h-[100dvh] rounded-t-20 pb-[env(safe-area-inset-bottom)]"
          : "right-6 bottom-6 h-[620px] max-h-[calc(100dvh-3rem)] w-[400px] rounded-20",
      )}
    >
      {/* header */}
      <div className="relative shrink-0 border-b border-soft-200 bg-white-0">
        {isMobile && <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 rounded-full bg-sub-300" />}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="relative size-8 overflow-hidden rounded-full ring-1 ring-soft-200">
            <FluidOrb size={32} className="size-full" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-label-sm font-semibold text-strong-950">{m.name}</p>
            <p className="flex items-center gap-1.5 text-label-xs text-sub-600">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-success-base" />
              {m.online}
            </p>
          </div>
          <div className="relative flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={m.menu}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="inline-flex size-9 items-center justify-center rounded-8 text-sub-600 hover:bg-weak-50 hover:text-strong-950 focus-ring"
            >
              <DotsThree size={20} weight="regular" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-10 z-10 min-w-44 rounded-12 border border-soft-200 bg-white-0 p-1 shadow-regular-md">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onClear();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-8 px-3 py-2 text-left text-label-sm text-strong-950 hover:bg-weak-50 focus-ring"
                >
                  <Trash size={16} aria-hidden="true" />
                  {m.clear}
                </button>
              </div>
            )}
            <button type="button" onClick={onMinimize} aria-label={m.minimize} className="inline-flex size-9 items-center justify-center rounded-8 text-sub-600 hover:bg-weak-50 hover:text-strong-950 focus-ring">
              <Minus size={20} aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose} aria-label={m.close} className="inline-flex size-9 items-center justify-center rounded-8 text-sub-600 hover:bg-weak-50 hover:text-strong-950 focus-ring">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        <HillLine className="absolute inset-x-0 -bottom-px h-3 opacity-70" stroke="stroke-primary-base" />
      </div>

      {/* messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain bg-qum-50 px-3 py-4" aria-live="polite" aria-label={m.messages}>
        {showWelcome && (
          <div className="rounded-16 rounded-tl-[6px] bg-white-0 p-4 ring-1 ring-soft-200">
            <p className="text-label-md font-semibold text-strong-950">{m.welcomeTitle}</p>
            <p className="mt-1.5 text-paragraph-sm text-sub-600">{m.welcomeText}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {welcomeChips.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => onSend(c)}
                    className="inline-flex h-9 items-center rounded-full border border-soft-200 bg-white-0 px-3 text-label-sm text-strong-950 transition-colors duration-150 hover:border-sub-300 hover:bg-weak-50 focus-ring"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ol className="flex flex-col gap-3">
          {messages.map((msg) => (
            <li key={msg.id} className={cn("group flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
              <span className="sr-only">{msg.role === "user" ? m.you : m.assistant}:</span>
              <div
                className={cn(
                  "max-w-[88%] whitespace-pre-line px-3.5 py-2.5 text-paragraph-sm",
                  msg.role === "user"
                    ? "rounded-16 rounded-br-[6px] bg-strong-950 text-white-0"
                    : "rounded-16 rounded-tl-[6px] bg-white-0 text-strong-950 ring-1 ring-soft-200",
                )}
              >
                {msg.text}
                {msg.streaming && <span aria-hidden="true" className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 animate-pulse bg-primary-base" />}
              </div>
              {msg.role === "assistant" && !msg.streaming && msg.vacancies && msg.vacancies.length > 0 && (
                <ul className="mt-1 flex w-full max-w-[92%] flex-col gap-2">
                  {msg.vacancies.map((v) => (
                    <li key={v.id}>
                      <MiniCard card={v} locale={locale} onNavigate={isMobile ? onClose : undefined} />
                    </li>
                  ))}
                </ul>
              )}
              {msg.role === "assistant" && !msg.streaming && msg.link && (
                <Link
                  href={msg.link.href}
                  onClick={isMobile ? onClose : undefined}
                  className="mt-1 inline-flex h-9 items-center rounded-8 border border-soft-200 bg-white-0 px-3 text-label-sm font-medium text-strong-950 hover:border-sub-300 hover:bg-weak-50 focus-ring"
                >
                  {msg.link.label}
                </Link>
              )}
              {msg.role === "assistant" && !msg.streaming && msg.suggestions && msg.suggestions.length > 0 && (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => onSend(c)}
                        className="inline-flex h-8 items-center rounded-full border border-soft-200 bg-white-0 px-2.5 text-label-xs text-strong-950 hover:border-sub-300 hover:bg-weak-50 focus-ring"
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Time at={msg.at} locale={locale} />
            </li>
          ))}
          {pending && (
            <li className="flex items-start" aria-label={m.typing}>
              <div className="flex h-9 items-center gap-1 rounded-16 rounded-tl-[6px] bg-white-0 px-3.5 ring-1 ring-soft-200">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={cn("size-1.5 rounded-full bg-sub-300", !reduce && "animate-bounce")}
                    style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
                  />
                ))}
                <span className="sr-only">{m.typing}</span>
              </div>
            </li>
          )}
        </ol>
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex shrink-0 items-end gap-2 border-t border-soft-200 bg-white-0 p-3"
      >
        <label htmlFor="ai-composer" className="sr-only">
          {m.placeholder}
        </label>
        <textarea
          id="ai-composer"
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={300}
          placeholder={m.placeholder}
          enterKeyHint="send"
          autoComplete="off"
          spellCheck={false}
          className="max-h-[132px] min-h-11 flex-1 resize-none rounded-10 border border-soft-200 bg-white-0 px-3.5 py-2.5 text-paragraph-md text-strong-950 placeholder:text-soft-400 hover:border-sub-300 focus-ring"
        />
        <button
          type="submit"
          disabled={!draft.trim() || pending}
          aria-label={m.send}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-10 bg-primary-base text-white-0 transition-colors duration-150 hover:bg-primary-dark disabled:bg-weak-50 disabled:text-disabled-300 focus-ring"
        >
          <PaperPlaneRight size={20} aria-hidden="true" />
        </button>
      </form>
    </motion.div>
  );
}
