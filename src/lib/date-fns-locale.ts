import { enUS, fi } from "date-fns/locale";

import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";

export function dateFnsLocale(locale: AppLocale = DEFAULT_APP_LOCALE) {
  return locale === "fi" ? fi : enUS;
}

export function intlDateLocale(locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return locale === "fi" ? "fi-FI" : "en-GB";
}

export function datePickerDisplayFormat(locale: AppLocale, compact: boolean): string {
  if (locale === "fi") {
    return compact ? "d.M.yy" : "d.M.yyyy";
  }

  return compact ? "d MMM yy" : "MMM d, yyyy";
}

export function timePickerDisplayFormat(locale: AppLocale): string {
  return locale === "fi" ? "HH.mm" : "h:mm a";
}
