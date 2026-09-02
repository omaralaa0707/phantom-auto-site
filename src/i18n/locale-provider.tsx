"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale, SiteContent } from "./schema";

type LocaleContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  content: SiteContent;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "site-locale";

/**
 * localStorage is the source of truth for the visitor's choice, so it is read
 * as an external store rather than copied into state from an effect. The
 * server snapshot is the default locale, which keeps the first client render
 * identical to the markup; React then re-reads the real value after
 * hydration.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function emit() {
  listeners.forEach((fn) => fn());
}

function readStored(): Locale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "ar" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}

export function LocaleProvider({
  children,
  dictionaries,
  defaultLocale = "ar",
}: {
  children: ReactNode;
  dictionaries: Record<Locale, SiteContent>;
  defaultLocale?: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    () => readStored() ?? defaultLocale,
    () => defaultLocale
  );

  // The <html> element owns lang/dir so CSS logical properties and screen
  // readers both follow the toggle.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode: the toggle still works for this page view */
    }
    emit();
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  const content = dictionaries[locale];

  return (
    <LocaleContext.Provider
      value={{
        locale,
        dir: locale === "ar" ? "rtl" : "ltr",
        content,
        setLocale,
        toggleLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

/** Shorthand for the common case of only needing the copy. */
export function useContent() {
  return useLocale().content;
}
