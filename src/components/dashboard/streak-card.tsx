import { intlDateLocale } from "@/lib/date-fns-locale";
import { getRequestLocale } from "@/lib/locale-server";
import type { AppLocale } from "@/lib/locale";
import { loadAthleteStreak } from "@/lib/load-athlete-streak";
import { getMessages } from "@/lib/messages";
import { getZonedDateString } from "@/lib/time-zone";
import type { AthleteStreak } from "@/lib/types";

function weekdayLabel(date: string, locale: AppLocale): string {
  const [year, month, day] = date.split("-").map((part) => Number.parseInt(part, 10));
  const formatted = new Intl.DateTimeFormat(intlDateLocale(locale), {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)));

  return formatted.replace(/\.$/, "");
}

function DayBall({ logged, today }: { logged: boolean; today: boolean }) {
  const className = logged
    ? "flex size-9 shrink-0 items-center justify-center self-center rounded-[16px] bg-[#ff9f0a]"
    : today
      ? "size-9 shrink-0 self-center rounded-[16px] border-[3px] border-[#ff9f0a]"
      : "size-9 shrink-0 self-center rounded-[16px] bg-[#3a3a3c]";

  return (
    <span className={className}>
      {logged ? (
        <svg
          viewBox="0 0 20 20"
          className="size-4"
          aria-hidden="true"
          fill="none"
          stroke="#1c1408"
          strokeWidth="2.25"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 10.5 3.5 3.5 6.5-8" />
        </svg>
      ) : null}
    </span>
  );
}

function StreakFlame({ variant }: { variant: "current" | "best" }) {
  const gradientId = variant === "current" ? "streak-flame-current" : "streak-flame-best";

  return (
    <svg viewBox="0 0 24 32" className="h-4 w-3 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient
          id={gradientId}
          x1="12"
          y1="31"
          x2="12"
          y2="1"
          gradientUnits="userSpaceOnUse"
        >
          {variant === "current" ? (
            <>
              <stop offset="0%" stopColor="#FFE566" />
              <stop offset="48%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF9800" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FFD54A" />
              <stop offset="42%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#F44336" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M12 1.2c1.2 4.4 6.4 7 6.4 12.6 0 1.7-.4 3.1-1.2 4.4 2.3-1.3 4.1-3.8 4.2-3.9.9 2.6.2 5.2-1 7.3C18.2 26.2 15.3 30 12 30c-4.8 0-8.2-3.8-8.2-8.6 0-4 2.3-6.3 3.6-8.8.6 2.4 2.4 3.6 2.4 3.6C10.2 11.2 11 5.8 12 1.2Z"
      />
    </svg>
  );
}

function StreakSummary({
  streak,
  timeZone,
  locale,
}: {
  streak: AthleteStreak;
  timeZone: string;
  locale: AppLocale;
}) {
  const messages = getMessages(locale).dashboard;
  const today = getZonedDateString(timeZone);

  return (
    <>
      <ol className="mt-6 flex justify-between">
        {streak.days.map((day) => {
          const isToday = day.date === today;

          return (
            <li key={day.date} className="flex w-9 flex-col items-center gap-2.5">
              <DayBall logged={day.logged} today={isToday} />
              <span
                className={
                  isToday
                    ? "text-sm font-bold leading-none text-[#ff9f0a]"
                    : "text-sm font-semibold leading-none text-[#8e8e93]"
                }
              >
                {weekdayLabel(day.date, locale)}
              </span>
              <span className="sr-only">
                {day.logged ? messages.streakDayLogged : messages.streakDayNotLogged}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8e8e93] uppercase">
            {messages.streakCurrent}
          </p>
          <p className="mt-2.5 flex items-center gap-2 text-base font-semibold leading-none text-white">
            <StreakFlame variant="current" />
            {messages.streakDays(streak.currentStreakDays)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8e8e93] uppercase">
            {messages.streakBest}
          </p>
          <p className="mt-2.5 flex items-center gap-2 text-base font-semibold leading-none text-white">
            <StreakFlame variant="best" />
            {messages.streakDays(streak.bestStreakDays)}
          </p>
        </div>
      </div>
    </>
  );
}

export async function StreakCard({ athleteId, timeZone }: { athleteId: string; timeZone: string }) {
  const [locale, result] = await Promise.all([
    getRequestLocale(),
    loadAthleteStreak(athleteId, timeZone),
  ]);
  const messages = getMessages(locale).dashboard;

  return (
    <section aria-label={messages.streakTitle} className="rounded-2xl bg-[#171b22] px-4 py-4">
      <h2 className="text-base font-semibold text-white">{messages.streakTitle}</h2>
      {result.streak ? (
        <StreakSummary streak={result.streak} timeZone={timeZone} locale={locale} />
      ) : (
        <p className="mt-4 text-sm text-red-300">{result.error}</p>
      )}
    </section>
  );
}
