import Link from "next/link";

import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";

import { athleteStatsHref } from "./dashboard-nav";

const PERIOD_OPTIONS: Array<{
  value: HockeyStatsPeriod;
  label: string;
  shortLabel: string;
}> = [
  { value: "day", label: "Today", shortLabel: "Today" },
  { value: "week", label: "This week", shortLabel: "Week" },
  { value: "month", label: "This month", shortLabel: "Month" },
];

type HockeyStatsSectionProps = {
  athleteId: string;
  sportName: string;
  period: HockeyStatsPeriod;
  children: React.ReactNode;
};

export function HockeyStatsSection({
  athleteId,
  sportName,
  period,
  children,
}: HockeyStatsSectionProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <h2 className="min-w-0 truncate text-sm font-semibold text-white sm:text-base">
          {sportName} stats
        </h2>
        <div className="flex shrink-0 rounded-lg bg-white/5 p-0.5">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.value === period;
            const className =
              "rounded-md px-2 py-1 text-xs font-medium transition-colors sm:px-2.5 " +
              (isActive ? "bg-[#9ec9e8] text-[#171b22]" : "text-zinc-400 hover:text-white");
            const label = (
              <>
                <span className="sm:hidden">{option.shortLabel}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </>
            );

            if (isActive) {
              return (
                <span
                  key={option.value}
                  aria-current="page"
                  aria-label={option.label}
                  className={className}
                >
                  {label}
                </span>
              );
            }

            return (
              <Link
                key={option.value}
                href={athleteStatsHref(athleteId, option.value)}
                aria-label={option.label}
                className={className}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
