"use server";

import { cookies } from "next/headers";

import { LOCALE_COOKIE_MAX_AGE_SECONDS, LOCALE_COOKIE_NAME, parseAppLocale } from "@/lib/locale";

export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = parseAppLocale(String(formData.get("locale") ?? ""));

  if (!locale) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
}
