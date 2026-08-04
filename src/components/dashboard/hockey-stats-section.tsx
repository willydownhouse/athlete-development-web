"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";

const PERIOD_OPTIONS: Array<{ value: HockeyStatsPeriod; label: string }> = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

type HockeyStatsSectionProps = {
  period: HockeyStatsPeriod;
  children: React.ReactNode;
};

export function HockeyStatsSection({ period, children }: HockeyStatsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(nextPeriod: HockeyStatsPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("statsPeriod", nextPeriod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Hockey stats</h2>
        <div className="flex rounded-lg bg-white/5 p-0.5">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.value === period;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPeriod(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive ? "bg-[#9ec9e8] text-[#171b22]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
