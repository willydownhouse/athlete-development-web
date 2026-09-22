import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

export function chatExampleAthleteName(
  name: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return name.trim().split(/\s+/).find(Boolean) ?? getMessages(locale).chat.fallbackAthlete;
}

export function chatEventLoggingExample(
  athleteName: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return getMessages(locale).chat.loggingExample(chatExampleAthleteName(athleteName, locale));
}

export function chatEventUpdateExample(locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return getMessages(locale).chat.updateExample;
}

export function chatEmptyIntro(
  athleteName: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return getMessages(locale).chat.emptyIntro(chatEventLoggingExample(athleteName, locale));
}
