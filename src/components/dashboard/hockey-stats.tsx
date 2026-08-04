import { buildHockeyStatTiles } from "@/lib/hockey-stats/build-hockey-stat-tiles";
import { fetchHockeySportStats } from "@/lib/hockey-stats/fetch-sport-stats";

import { HockeyStatsCard } from "./hockey-stats-card";

type HockeyStatsProps = {
  athleteId: string;
  sportId: string;
  startedAtFrom: string;
  startedAtTo: string;
  periodLabel?: string;
};

export async function HockeyStats({
  athleteId,
  sportId,
  startedAtFrom,
  startedAtTo,
  periodLabel,
}: HockeyStatsProps) {
  const result = await fetchHockeySportStats(athleteId, sportId, startedAtFrom, startedAtTo);

  if (result.error || !result.sportStats) {
    return <HockeyStatsCard tiles={[]} loadError={result.error} periodLabel={periodLabel} />;
  }

  const tiles = buildHockeyStatTiles(result.sportStats);

  if (tiles.length === 0) {
    return null;
  }

  return <HockeyStatsCard tiles={tiles} periodLabel={periodLabel} />;
}
