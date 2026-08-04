/** Metric keys to include in hockey stats totals. Matched against event metric definitions. */
export const HOCKEY_STAT_METRIC_KEYS = [
  "shot_count",
  "goal_count",
  "assist_count",
  "save_count",
  "playing_time_seconds",
] as const;

export type HockeyStatMetricKey = (typeof HOCKEY_STAT_METRIC_KEYS)[number];
