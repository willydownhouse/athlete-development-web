import Link from "next/link";

import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";

import { athleteStatsHref } from "./dashboard-nav";

const PERIOD_OPTIONS: Array<{ value: HockeyStatsPeriod; label: string }> = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

type HockeyStatsSectionProps = {
  athleteId: string;
  period: HockeyStatsPeriod;
  children: React.ReactNode;
};

export function HockeyStatsSection({ athleteId, period, children }: HockeyStatsSectionProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex justify-start">
        <div className="flex rounded-lg bg-white/5 p-0.5">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.value === period;
            const className = `rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive ? "bg-[#9ec9e8] text-[#171b22]" : "text-zinc-400 hover:text-white"
            }`;

            if (isActive) {
              return (
                <span key={option.value} aria-current="page" className={className}>
                  {option.label}
                </span>
              );
            }

            return (
              <Link
                key={option.value}
                href={athleteStatsHref(athleteId, option.value)}
                className={className}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
