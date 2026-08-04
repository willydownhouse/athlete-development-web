import { getLocalDayRange, getLocalMonthRange, getLocalWeekRange } from "@/lib/date-range";

const HOCKEY_STATS_PERIODS = ["day", "week", "month"] as const;

export type HockeyStatsPeriod = (typeof HOCKEY_STATS_PERIODS)[number];

export function parseHockeyStatsPeriod(value: string | undefined): HockeyStatsPeriod {
  if (value && HOCKEY_STATS_PERIODS.includes(value as HockeyStatsPeriod)) {
    return value as HockeyStatsPeriod;
  }

  return "week";
}

export function getHockeyStatsRange(period: HockeyStatsPeriod): {
  startedAtFrom: string;
  startedAtTo: string;
} {
  switch (period) {
    case "day":
      return getLocalDayRange();
    case "week":
      return getLocalWeekRange();
    case "month":
      return getLocalMonthRange();
  }
}
