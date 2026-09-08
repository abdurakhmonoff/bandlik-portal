"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/types";
import type { AssistantReply, ChatMessage } from "@/lib/assistant/types";

const KEY = "bandlik:chat";
const MAX_HISTORY = 40;

function load(): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    return Array.isArray(parsed) ? parsed.map((m) => ({ ...m, streaming: false })) : [];
  } catch {
    return [];
  }
}

function persist(list: ChatMessage[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_HISTORY)));
  } catch {
    /* ignore */
  }
}

let counter = 0;
const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

/**
 * Chat state: history in sessionStorage, a typing indicator while the
 * request is in flight, and a word-by-word reveal of the reply so it
 * reads as streaming. Reduced motion → the full reply appears at once.
 */
export function useChat(locale: Locale, currentVacancy: string | null, reducedMotion: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => {
    // read sessionStorage after mount to keep server and client markup identical
    const stored = load();
    setMessages(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) persist(messages);
  }, [messages, hydrated]);

  useEffect(
    () => () => {
      if (revealTimer.current) window.clearInterval(revealTimer.current);
    },
    [],
  );

  const reveal = useCallback(
    (id: string, full: string) => {
      if (reducedMotion) {
        setMessages((list) => list.map((m) => (m.id === id ? { ...m, text: full, streaming: false } : m)));
        return;
      }
      const words = full.split(/(\s+)/);
      let i = 0;
      if (revealTimer.current) window.clearInterval(revealTimer.current);
      revealTimer.current = window.setInterval(() => {
        i += 2;
        const text = words.slice(0, i).join("");
        const done = i >= words.length;
        setMessages((list) => list.map((m) => (m.id === id ? { ...m, text: done ? full : text, streaming: !done } : m)));
        if (done && revealTimer.current) {
          window.clearInterval(revealTimer.current);
          revealTimer.current = null;
        }
      }, 28);
    },
    [reducedMotion],
  );

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || pending) return;
      const user: ChatMessage = { id: uid(), role: "user", text: clean, at: Date.now() };
      setMessages((list) => [...list, user]);
      setPending(true);
      let reply: AssistantReply;
      try {
        const res = await fetch("/api/yordamchi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean, locale, currentVacancy }),
        });
        if (!res.ok) throw new Error(String(res.status));
        reply = (await res.json()) as AssistantReply;
      } catch {
        reply = {
          text:
            locale === "ru"
              ? "Не получилось получить ответ. Проверьте соединение и попробуйте ещё раз."
              : "Javob olib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring.",
          intent: "error",
        };
      }
      // a short, honest pause so the typing indicator reads as thinking, not lag
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 350));
      const id = uid();
      const assistant: ChatMessage = {
        id,
        role: "assistant",
        text: reducedMotion ? reply.text : "",
        at: Date.now(),
        vacancies: reply.vacancies,
        suggestions: reply.suggestions,
        link: reply.link,
        streaming: !reducedMotion,
      };
      setPending(false);
      setMessages((list) => [...list, assistant]);
      reveal(id, reply.text);
    },
    [pending, locale, currentVacancy, reducedMotion, reveal],
  );

  const clear = useCallback(() => {
    if (revealTimer.current) window.clearInterval(revealTimer.current);
    setMessages([]);
    try {
      window.sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { messages, pending, send, clear, hydrated };
}
