import { describe, expect, it } from "vitest";

import { aggregateHockeyStats, formatHockeyStatTotal } from "./aggregate";
import type { Event, EventMetric, MetricDefinition } from "@/lib/types";

function buildMetricDefinition(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: "metric-def-1",
    sportId: "00000000-0000-4000-8000-000000000001",
    key: "shot_count",
    name: "Shot count",
    description: null,
    valueType: "number",
    canonicalUnit: "shots",
    active: true,
    createdAt: "2026-07-28T12:00:00.000Z",
    updatedAt: "2026-07-28T12:00:00.000Z",
    sport: null,
    ...overrides,
  };
}

function buildMetric(
  metricDefinition: MetricDefinition,
  overrides: Partial<EventMetric> = {},
): EventMetric {
  return {
    id: "metric-1",
    eventId: "event-1",
    metricDefinitionId: metricDefinition.id,
    numericValue: null,
    textValue: null,
    booleanValue: null,
    unit: null,
    createdAt: "2026-07-28T12:00:00.000Z",
    updatedAt: "2026-07-28T12:00:00.000Z",
    metricDefinition,
    ...overrides,
  };
}

function buildEvent(metrics: EventMetric[], overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    athleteId: "athlete-1",
    eventTypeId: "event-type-shooting",
    sportId: "00000000-0000-4000-8000-000000000001",
    category: "training",
    title: "Shooting practice",
    description: null,
    startedAt: "2026-08-01T10:00:00.000Z",
    endedAt: null,
    durationSeconds: 3600,
    intensity: "moderate",
    source: "form",
    originalInput: null,
    structuredData: null,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    eventType: {
      id: "event-type-shooting",
      sportId: "00000000-0000-4000-8000-000000000001",
      category: "training",
      slug: "shooting",
      name: "Shooting",
      active: true,
      createdAt: "2026-07-28T12:00:00.000Z",
      updatedAt: "2026-07-28T12:00:00.000Z",
      sport: null,
    },
    metrics,
    ...overrides,
  };
}

const shotCount = buildMetricDefinition({
  id: "00000000-0000-4000-8000-000000000401",
  key: "shot_count",
  name: "Shot count",
  canonicalUnit: "shots",
});

const goalCount = buildMetricDefinition({
  id: "00000000-0000-4000-8000-000000000402",
  key: "goal_count",
  name: "Goal count",
  canonicalUnit: "goals",
});

const assistCount = buildMetricDefinition({
  id: "00000000-0000-4000-8000-000000000403",
  key: "assist_count",
  name: "Assist count",
  canonicalUnit: "assists",
});

const playingTime = buildMetricDefinition({
  id: "00000000-0000-4000-8000-000000000316",
  sportId: null,
  key: "playing_time_seconds",
  name: "Playing time",
  canonicalUnit: "s",
});

const rpe = buildMetricDefinition({
  id: "00000000-0000-4000-8000-000000000311",
  sportId: null,
  key: "rpe",
  name: "RPE",
  canonicalUnit: null,
});

const shootingPractice = buildEvent([
  buildMetric(shotCount, { id: "metric-shots-1", numericValue: "50" }),
  buildMetric(rpe, { id: "metric-rpe-1", numericValue: "7" }),
]);

const firstGame = buildEvent(
  [
    buildMetric(goalCount, { id: "metric-goals-1", numericValue: "2" }),
    buildMetric(assistCount, { id: "metric-assists-1", numericValue: "1" }),
    buildMetric(playingTime, { id: "metric-time-1", numericValue: "1200" }),
  ],
  {
    id: "event-game-1",
    eventTypeId: "event-type-game",
    category: "competition",
    title: "League game",
    eventType: {
      id: "event-type-game",
      sportId: "00000000-0000-4000-8000-000000000001",
      category: "competition",
      slug: "game",
      name: "Game",
      active: true,
      createdAt: "2026-07-28T12:00:00.000Z",
      updatedAt: "2026-07-28T12:00:00.000Z",
      sport: null,
    },
  },
);

const secondGame = buildEvent(
  [
    buildMetric(goalCount, { id: "metric-goals-2", numericValue: "1" }),
    buildMetric(playingTime, { id: "metric-time-2", numericValue: "900" }),
  ],
  {
    id: "event-game-2",
    eventTypeId: "event-type-game",
    category: "competition",
    title: "Friendly",
    eventType: firstGame.eventType,
  },
);

describe("aggregateHockeyStats", () => {
  it("returns an empty array when there are no events", () => {
    expect(aggregateHockeyStats([])).toEqual([]);
  });

  it("returns an empty array when events have no tracked metrics", () => {
    const gymSession = buildEvent([buildMetric(rpe, { id: "metric-rpe-2", numericValue: "6" })]);

    expect(aggregateHockeyStats([gymSession])).toEqual([]);
  });

  it("totals tracked metrics from a single event", () => {
    expect(aggregateHockeyStats([shootingPractice])).toEqual([
      {
        key: "shot_count",
        name: "Shot count",
        canonicalUnit: "shots",
        total: 50,
      },
    ]);
  });

  it("sums the same metric across multiple events", () => {
    expect(aggregateHockeyStats([firstGame, secondGame])).toEqual([
      {
        key: "goal_count",
        name: "Goal count",
        canonicalUnit: "goals",
        total: 3,
      },
      {
        key: "assist_count",
        name: "Assist count",
        canonicalUnit: "assists",
        total: 1,
      },
      {
        key: "playing_time_seconds",
        name: "Playing time",
        canonicalUnit: "s",
        total: 2100,
      },
    ]);
  });

  it("keeps configured key order and omits metrics that never appear", () => {
    const mixedEvents = [shootingPractice, firstGame];

    expect(aggregateHockeyStats(mixedEvents).map((stat) => stat.key)).toEqual([
      "shot_count",
      "goal_count",
      "assist_count",
      "playing_time_seconds",
    ]);
  });

  it("ignores non-numeric and invalid numeric metric values", () => {
    const event = buildEvent([
      buildMetric(shotCount, { id: "metric-shots-null", numericValue: null }),
      buildMetric(goalCount, { id: "metric-goals-invalid", numericValue: "not-a-number" }),
      buildMetric(assistCount, { id: "metric-assists-valid", numericValue: "2" }),
    ]);

    expect(aggregateHockeyStats([event])).toEqual([
      {
        key: "assist_count",
        name: "Assist count",
        canonicalUnit: "assists",
        total: 2,
      },
    ]);
  });
});

describe("formatHockeyStatTotal", () => {
  it("formats duration metrics", () => {
    expect(
      formatHockeyStatTotal({
        name: "Playing time",
        canonicalUnit: "s",
        total: 2100,
      }),
    ).toBe("35 min");
  });

  it("formats count metrics with units", () => {
    expect(
      formatHockeyStatTotal({
        name: "Goal count",
        canonicalUnit: "goals",
        total: 3,
      }),
    ).toBe("3 goals");
  });

  it("formats RPE metrics without the scale unit", () => {
    expect(
      formatHockeyStatTotal({
        name: "RPE",
        canonicalUnit: "scale_1_10",
        total: 7,
      }),
    ).toBe("7");
  });
});
