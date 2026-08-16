import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatHockeyStatTotal } from "@/lib/hockey-stats/aggregate";
import type { SportStats } from "@/lib/types";

export type HockeyStatTile = {
  key: string;
  value: string;
  eventCount?: number;
  label: string;
  subtitle?: string;
};

export function buildHockeyStatTiles(sportStats: SportStats): HockeyStatTile[] {
  const eventTypes = Object.entries(sportStats.eventTypes)
    .map(([eventTypeId, stats]) => ({ eventTypeId, ...stats }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const tiles: HockeyStatTile[] = [];

  for (const eventType of eventTypes) {
    if (eventType.durationSeconds > 0) {
      tiles.push({
        key: `${eventType.eventTypeId}-duration`,
        value: formatDurationSeconds(eventType.durationSeconds),
        label: eventType.name,
      });
    }

    const metrics = Object.entries(eventType.metrics ?? {}).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey),
    );

    for (const [metricKey, metric] of metrics) {
      tiles.push({
        key: `${eventType.eventTypeId}-${metricKey}`,
        value: formatHockeyStatTotal({
          key: metricKey,
          name: metric.name,
          canonicalUnit: metric.canonicalUnit,
          total: metric.total,
        }),
        eventCount: metric.eventCount,
        label: metric.name,
        subtitle: eventType.name,
      });
    }
  }

  return tiles;
}
