"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LockKey, Eye, EyeSlash } from "@phosphor-icons/react";
import { isAdminSession, signIn } from "@/lib/admin/auth";
import { Mark, Wordmark } from "@/components/site/logo";
import { HillEdge } from "@/components/site/hill";
import { spring } from "@/lib/motion";

/** Client-side gate: shows the login card until the session flag is set. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setState(isAdminSession() ? "open" : "locked");
  }, []);

  if (state === "open") return <>{children}</>;
  if (state === "checking") return <div className="min-h-dvh bg-sand-light" aria-busy="true" />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (signIn(login, password)) {
      setState("open");
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-sand-light px-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <HillEdge fill="primary" height={200} className="opacity-10" />
        <HillEdge fill="sand" height={120} className="absolute inset-x-0 bottom-0" />
      </div>
      <motion.form
        onSubmit={submit}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.hero}
        className="relative z-10 w-full max-w-sm rounded-20 border border-soft-200 bg-white-0 p-6 shadow-regular-md sm:p-8"
        aria-labelledby="admin-login-title"
      >
        <div className="flex items-center gap-2.5">
          <Mark size={28} />
          <Wordmark size="sm" />
        </div>
        <h1 id="admin-login-title" className="mt-6 text-title-h5">
          Boshqaruv paneli
        </h1>
        <p className="mt-1 text-paragraph-sm text-sub-600">Faqat hokimlik xodimlari uchun.</p>

        <label htmlFor="admin-login" className="mt-6 block text-label-sm font-medium text-strong-950">
          Login
        </label>
        <input
          id="admin-login"
          name="username"
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          className="mt-1.5 h-11 w-full rounded-8 border border-soft-200 bg-white-0 px-3.5 text-paragraph-md text-strong-950 placeholder:text-soft-400 hover:border-sub-300 focus-ring"
        />
        <label htmlFor="admin-password" className="mt-4 block text-label-sm font-medium text-strong-950">
          Parol
        </label>
        <div className="relative mt-1.5">
          <input
            id="admin-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            required
            aria-invalid={error || undefined}
            aria-describedby={error ? "admin-error" : undefined}
            className="h-11 w-full rounded-8 border border-soft-200 bg-white-0 px-3.5 pr-11 text-paragraph-md text-strong-950 hover:border-sub-300 focus-ring aria-[invalid]:border-error-base"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Parolni yashirish" : "Parolni koʻrsatish"}
            className="absolute right-1 top-1 inline-flex size-9 items-center justify-center rounded-6 text-sub-600 hover:bg-weak-50 hover:text-strong-950 focus-ring"
          >
            {show ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
        {error && (
          <p id="admin-error" role="alert" className="mt-2 text-label-sm text-error-base">
            Login yoki parol notoʻgʻri.
          </p>
        )}
        <button
          type="submit"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-8 bg-primary-base text-label-md font-semibold text-white-0 transition-colors duration-150 hover:bg-primary-dark focus-ring"
        >
          <LockKey size={20} aria-hidden="true" />
          Kirish
        </button>
        <p className="mt-4 text-label-xs text-soft-400">Kirish brauzer sessiyasi davomida saqlanadi.</p>
      </motion.form>
    </div>
  );
}
