import {
  getSystemTimeZone,
  getZonedDayRange,
  getZonedMonthRange,
  getZonedWeekRange,
} from "@/lib/time-zone";

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
};
export function getHockeyStatsRange(
  period: HockeyStatsPeriod,
  timeZone: string,
): {
  startedAtFrom: string;
  startedAtTo: string;
};
export function getHockeyStatsRange(
  period: HockeyStatsPeriod,
  timeZone = getSystemTimeZone(),
): {
  startedAtFrom: string;
  startedAtTo: string;
} {
  switch (period) {
    case "day":
      return getZonedDayRange(timeZone);
    case "week":
      return getZonedWeekRange(timeZone);
    case "month":
      return getZonedMonthRange(timeZone);
  }
}
