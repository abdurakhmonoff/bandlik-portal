"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Saved vacancies live in localStorage only — no accounts, no server.
 * A tiny external store so every bookmark button and the header counter
 * stay in sync across the page.
 */
const KEY = "bandlik:saved";
const EVENT = "bandlik:saved-change";
const EMPTY: readonly string[] = [];

let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: readonly string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or quota — keep the in-memory copy */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedIds(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useSaved(id: string) {
  const ids = useSavedIds();
  const saved = ids.includes(id);
  const toggle = useCallback(() => {
    const current = read();
    write(current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]);
  }, [id]);
  return { saved, toggle };
}

export function clearSaved() {
  write([]);
}

export function removeSaved(id: string) {
  write(read().filter((x) => x !== id));
}
