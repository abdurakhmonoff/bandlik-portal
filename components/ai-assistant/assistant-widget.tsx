"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, useReducedMotion } from "motion/react";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { welcomeChips } from "@/lib/assistant/chips";
import { useChat } from "@/components/ai-assistant/use-chat";
import { Launcher } from "@/components/ai-assistant/launcher";
import { Bubbles } from "@/components/ai-assistant/bubbles";
import { Panel } from "@/components/ai-assistant/panel";

const SESSION_KEY = "bandlik:assistant-proactive";
const DAY_KEY = "bandlik:assistant-dismissed";
const SCROLL_THRESHOLD = 240;
const PROACTIVE_DELAY = 6000;
const AUTO_DISMISS = 12000;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

function vacancySlugFromPath(pathname: string): string | null {
  const m = pathname.match(/\/vakansiyalar\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * AI yordamchi — launcher, proactive bubbles and the panel.
 * The panel scales out of the badge corner. Bubbles fire once per
 * session, 6s after the first meaningful scroll, never on the same day
 * after a dismissal. No sound, ever.
 */
export function AssistantWidget({ locale }: { locale: Locale }) {
  const m = getMessages(locale).assistant;
  const reduce = useReducedMotion() ?? false;
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const currentVacancy = vacancySlugFromPath(pathname);
  const [open, setOpen] = useState(false);
  const [bubbles, setBubbles] = useState(false);
  const [unread, setUnread] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const openedOnce = useRef(false);
  const { messages, pending, send, clear } = useChat(locale, currentVacancy, reduce);

  const bubbleTexts = [m.bubbles.hello, currentVacancy ? m.bubbles.similar : m.bubbles.prompt];

  /* proactive bubbles — once per session, after first meaningful scroll */
  useEffect(() => {
    if (reduce) return;
    let armed = true;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") armed = false;
      if (window.localStorage.getItem(DAY_KEY) === today()) armed = false;
    } catch {
      /* storage unavailable → still show once */
    }
    if (!armed) return;
    let timer: number | null = null;
    let hide: number | null = null;
    const onScroll = () => {
      if (window.scrollY < SCROLL_THRESHOLD) return;
      window.removeEventListener("scroll", onScroll);
      timer = window.setTimeout(() => {
        if (openedOnce.current) return;
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
        setBubbles(true);
        setUnread(true);
        hide = window.setTimeout(() => setBubbles(false), AUTO_DISMISS);
      }, PROACTIVE_DELAY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) window.clearTimeout(timer);
      if (hide) window.clearTimeout(hide);
    };
  }, [reduce]);

  const openPanel = useCallback(() => {
    openedOnce.current = true;
    setBubbles(false);
    setUnread(false);
    setOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    // return focus to the badge
    window.setTimeout(() => launcherRef.current?.focus(), 30);
  }, []);

  const dismissForToday = useCallback(() => {
    setBubbles(false);
    setUnread(false);
    try {
      window.localStorage.setItem(DAY_KEY, today());
    } catch {
      /* ignore */
    }
  }, []);

  /* lock body scroll while the mobile sheet is open */
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  return (
    <>
      <noscript>
        <p className="sr-only">{m.noJs}</p>
      </noscript>
      <Bubbles items={bubbleTexts} open={bubbles && !open} onOpen={openPanel} onDismiss={dismissForToday} dismissLabel={m.dismiss} />
      <Launcher
        ref={launcherRef}
        label={m.name}
        onlineLabel={m.online}
        unread={unread}
        unreadLabel={m.unread}
        onClick={openPanel}
        hidden={open}
      />
      <AnimatePresence initial={false}>
        {open && (
          <Panel
            key="panel"
            locale={locale}
            messages={messages}
            pending={pending}
            onSend={send}
            onClear={clear}
            onClose={closePanel}
            onMinimize={closePanel}
            welcomeChips={welcomeChips(locale)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </>
  );
}
