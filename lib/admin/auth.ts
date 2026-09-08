"use client";

/**
 * Demo-grade gate for /admin. Credentials are hard-coded and checked in the
 * browser; the flag lives in sessionStorage. This keeps casual visitors out
 * of the dashboard — it is not security. Replace with a real identity
 * provider before the panel controls anything.
 */
export const ADMIN_LOGIN = "admin";
export const ADMIN_PASSWORD = "Qiziltepa2026";

const KEY = "bandlik:admin";

export function isAdminSession(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function signIn(login: string, password: string): boolean {
  const ok = login.trim().toLowerCase() === ADMIN_LOGIN && password === ADMIN_PASSWORD;
  if (ok) {
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }
  return ok;
}

export function signOut() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
