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

export function chatEmptyIntro(locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return getMessages(locale).chat.emptyIntro;
}

export function chatOnboardingIntro(
  athleteName: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const name = athleteName.trim();
  return getMessages(locale).chat.interviewIntro(name || null);
}

export function chatOnboardingUpdateIntro(
  athleteName: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const name = athleteName.trim();
  return getMessages(locale).chat.interviewUpdateIntro(name || null);
}
