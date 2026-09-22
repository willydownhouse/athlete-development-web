import { setLocaleAction } from "@/app/actions/locale";
import { APP_LOCALES, type AppLocale } from "@/lib/locale";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "EN",
  fi: "FI",
};

export function LanguageToggle({ locale }: { locale: AppLocale }) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex rounded-xl border border-white/10 p-0.5"
    >
      {APP_LOCALES.map((option) => {
        const selected = option === locale;

        return (
          <form key={option} action={setLocaleAction} className="min-w-0 flex-1">
            <input type="hidden" name="locale" value={option} />
            <button
              type="submit"
              aria-pressed={selected}
              disabled={selected}
              className={`w-full rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                selected
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {LOCALE_LABELS[option]}
            </button>
          </form>
        );
      })}
    </div>
  );
}
