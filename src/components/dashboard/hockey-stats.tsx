import { buildHockeyStatTiles } from "@/lib/hockey-stats/build-hockey-stat-tiles";
import { fetchHockeySportStats } from "@/lib/hockey-stats/fetch-sport-stats";
import { getHockeyStatsRange, type HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import { getRequestLocale } from "@/lib/locale-server";

import { HockeyStatsCard } from "./hockey-stats-card";

type HockeyStatsProps = {
  athleteId: string;
  sportId: string;
  period: HockeyStatsPeriod;
  timeZone: string;
};

export async function HockeyStats({ athleteId, sportId, period, timeZone }: HockeyStatsProps) {
  const { startedAtFrom, startedAtTo } = getHockeyStatsRange(period, timeZone);
  const locale = await getRequestLocale();
  const result = await fetchHockeySportStats(
    athleteId,
    sportId,
    startedAtFrom,
    startedAtTo,
    locale,
  );

  if (result.error || !result.sportStats) {
    return <HockeyStatsCard tiles={[]} loadError={result.error} />;
  }

  const tiles = buildHockeyStatTiles(result.sportStats, locale);

  return <HockeyStatsCard tiles={tiles} />;
}
