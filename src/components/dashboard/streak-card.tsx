import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

const CURRENT_STREAK_DAYS = 0;
const BEST_STREAK_DAYS = 0;

function DayBall({ logged }: { logged: boolean }) {
  return (
    <span
      className={
        logged
          ? "flex size-9 shrink-0 items-center justify-center self-center rounded-[16px] bg-[#ff9f0a]"
          : "size-9 shrink-0 self-center rounded-[16px] bg-[#3a3a3c]"
      }
    >
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

export async function StreakCard() {
  const messages = getMessages(await getRequestLocale()).dashboard;
  const days = messages.streakWeekdays;

  return (
    <section aria-label={messages.streakTitle} className="rounded-2xl bg-[#171b22] px-4 py-4">
      <h2 className="text-base font-semibold text-white">{messages.streakTitle}</h2>

      <ol className="mt-6 flex justify-between">
        {days.map((label, index) => {
          const isToday = index === 0;

          return (
            <li key={label} className="flex w-9 flex-col items-center gap-2.5">
              <DayBall logged={isToday} />
              <span
                className={
                  isToday
                    ? "text-sm font-bold leading-none text-[#ff9f0a]"
                    : "text-sm font-semibold leading-none text-[#8e8e93]"
                }
              >
                {label}
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
            {messages.streakDays(CURRENT_STREAK_DAYS)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8e8e93] uppercase">
            {messages.streakBest}
          </p>
          <p className="mt-2.5 flex items-center gap-2 text-base font-semibold leading-none text-white">
            <StreakFlame variant="best" />
            {messages.streakDays(BEST_STREAK_DAYS)}
          </p>
        </div>
      </div>
    </section>
  );
}
