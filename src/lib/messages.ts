import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";
import { en, type Messages } from "@/messages/en";
import { fi } from "@/messages/fi";

const catalogs: Record<AppLocale, Messages> = { en, fi };

export type { Messages };

export function getMessages(locale: AppLocale = DEFAULT_APP_LOCALE): Messages {
  return catalogs[locale];
}
