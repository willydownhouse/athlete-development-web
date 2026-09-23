"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { AppLocale } from "@/lib/locale";

const LocaleContext = createContext<AppLocale | null>(null);

export function LocaleProvider({ locale, children }: { locale: AppLocale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useAppLocale(): AppLocale {
  const locale = useContext(LocaleContext);

  if (!locale) {
    throw new Error("useAppLocale must be used within LocaleProvider");
  }

  return locale;
}
