import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, locales, type Locale } from "./config";

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

function resolveLocaleFromHeader(acceptLanguage: string): Locale {
  const normalized = acceptLanguage.toLowerCase();

  if (normalized.includes("fi")) {
    return "fi";
  }

  if (normalized.includes("nb") || normalized.includes("no") || normalized.includes("nn")) {
    return "nb";
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") ?? "";

  const locale =
    cookieLocale && isLocale(cookieLocale) ? cookieLocale : resolveLocaleFromHeader(acceptLanguage);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
