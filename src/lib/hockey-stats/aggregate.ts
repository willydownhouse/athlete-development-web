import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import type { Event } from "@/lib/types";

import { HOCKEY_STAT_METRIC_KEYS, type HockeyStatMetricKey } from "./metric-definitions";

export type HockeyStatSummary = {
  key: HockeyStatMetricKey;
  name: string;
  canonicalUnit: string | null;
  total: number;
};

export function aggregateHockeyStats(events: Event[]): HockeyStatSummary[] {
  const totals = new Map<
    HockeyStatMetricKey,
    { total: number; name: string; canonicalUnit: string | null }
  >();

  for (const event of events) {
    for (const metric of event.metrics ?? []) {
      const key = metric.metricDefinition.key;

      if (!HOCKEY_STAT_METRIC_KEYS.includes(key as HockeyStatMetricKey)) {
        continue;
      }

      if (metric.numericValue === null) {
        continue;
      }

      const numericValue = Number(metric.numericValue);

      if (Number.isNaN(numericValue)) {
        continue;
      }

      const statKey = key as HockeyStatMetricKey;
      const existing = totals.get(statKey);

      if (existing) {
        existing.total += numericValue;
        continue;
      }

      totals.set(statKey, {
        total: numericValue,
        name: metric.metricDefinition.name,
        canonicalUnit: metric.metricDefinition.canonicalUnit,
      });
    }
  }

  return HOCKEY_STAT_METRIC_KEYS.flatMap((key) => {
    const total = totals.get(key);

    if (!total) {
      return [];
    }

    return [{ key, ...total }];
  });
}

export function formatHockeyStatTotal(stat: {
  name: string;
  canonicalUnit: string | null;
  total: number;
}): string {
  if (isSecondsMetric(stat.canonicalUnit)) {
    return formatDurationSeconds(stat.total);
  }

  const unit = formatMetricUnit(stat.canonicalUnit);

  if (unit) {
    return `${stat.total} ${unit}`;
  }

  return String(stat.total);
}
