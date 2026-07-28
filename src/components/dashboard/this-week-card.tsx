import { MOCK_WEEK_DAYS, MOCK_WEEK_LOAD_LABEL, type MockWeekDay } from "./mock-data";

const toneClass: Record<MockWeekDay["tone"], string> = {
  ice: "bg-[#5f7388]",
  recovery: "bg-[#6f8f6a]",
  gym: "bg-[#9a7f5f]",
  game: "bg-[#9a7f5f]",
  rest: "bg-[#6f8f6a]",
};

type ThisWeekCardProps = {
  empty?: boolean;
};

export function ThisWeekCard({ empty = false }: ThisWeekCardProps) {
  const days = empty ? [] : MOCK_WEEK_DAYS;

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">This week</h2>
        <span className="text-sm text-zinc-400">
          {empty ? "No load yet" : MOCK_WEEK_LOAD_LABEL}
        </span>
      </div>

      {days.length > 0 ? (
        <div className="mt-5 flex items-end justify-between gap-1.5">
          {days.map((day) => (
            <div key={day.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className={`flex w-full items-end justify-center rounded-xl ${toneClass[day.tone]}`}
                style={{ height: `${day.height}px` }}
              >
                <span className="pb-2 text-[10px] font-semibold tracking-wide text-white/90">
                  {day.label}
                </span>
              </div>
              <span className="text-xs text-zinc-400">{day.day}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Weekly load will appear once events are logged.
        </p>
      )}
    </section>
  );
}
