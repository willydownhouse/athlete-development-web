import { MOCK_QUICK_LOG_ACTIONS } from "./mock-data";

export function QuickLogCard() {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Quick log</h2>
        <span className="text-sm text-zinc-400">Tap or type</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {MOCK_QUICK_LOG_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-full border border-white/5 bg-[#252b34] px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-[#2f3641]"
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
