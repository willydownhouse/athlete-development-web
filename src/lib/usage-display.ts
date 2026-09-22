import { intlDateLocale } from "@/lib/date-fns-locale";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";

export function formatTokenCount(value: number, locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return new Intl.NumberFormat(intlDateLocale(locale)).format(value);
}

export function usageBarPercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

export function formatUsagePeriod(
  periodStartIso: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return new Intl.DateTimeFormat(intlDateLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(periodStartIso));
}
