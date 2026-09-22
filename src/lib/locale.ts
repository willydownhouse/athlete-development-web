export const APP_LOCALES = ["en", "fi"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_APP_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_NAME = "app_locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "en" || value === "fi";
}

export function parseAppLocale(value: string | null | undefined): AppLocale | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return isAppLocale(normalized) ? normalized : null;
}

export function parseAcceptLanguage(header: string | null | undefined): AppLocale {
  if (!header?.trim()) {
    return DEFAULT_APP_LOCALE;
  }

  const tags = header.split(",").map((part) => {
    const [range, ...params] = part.trim().split(";");
    const qParam = params.find((item) => item.trim().startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;

    return {
      range: range?.trim().toLowerCase() ?? "",
      q: Number.isFinite(q) ? q : 0,
    };
  });

  tags.sort((left, right) => right.q - left.q);

  for (const { range, q } of tags) {
    if (q <= 0 || !range) {
      continue;
    }

    const language = range.split("-")[0];
    if (isAppLocale(language)) {
      return language;
    }
  }

  return DEFAULT_APP_LOCALE;
}
