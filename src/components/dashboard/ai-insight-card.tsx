import { MOCK_AI_INSIGHT } from "./mock-data";

export function AiInsightCard() {
  return (
    <section className="rounded-[1.35rem] bg-[#1c2430] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">AI insight</h2>
        <span className="text-sm text-zinc-400">Now</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-zinc-200">{MOCK_AI_INSIGHT}</p>
    </section>
  );
}
