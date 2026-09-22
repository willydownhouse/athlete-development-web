import { cookies, headers } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  parseAcceptLanguage,
  parseAppLocale,
  type AppLocale,
} from "@/lib/locale";

function decodeCookieValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const fromCookie = parseAppLocale(decodeCookieValue(cookieStore.get(LOCALE_COOKIE_NAME)?.value));

  if (fromCookie) {
    return fromCookie;
  }

  const headerStore = await headers();
  return parseAcceptLanguage(headerStore.get("accept-language"));
}
