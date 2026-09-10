import { describe, expect, it } from "vitest";

import {
  eventItemIsCollapsible,
  eventItemSameTypeIndex,
  eventItemTitle,
  eventItemsSectionTitle,
  formatEventItemCollapsedCounts,
  formatEventItemMetricSummary,
  formatEventItemTimeRange,
  pluralizeItemTypeName,
  shouldUseCompactItemMetrics,
} from "./event-item-display";
import type { EventItem, EventItemMetric, EventItemType, MetricDefinition } from "./types";

const timestamp = "2026-08-05T10:00:00.000Z";

function buildItemType(overrides: Partial<EventItemType> = {}): EventItemType {
  return {
    id: "exercise-type-id",
    sportId: null,
    slug: "exercise",
    name: "Exercise",
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    sport: null,
    ...overrides,
  };
}

function buildMetricDefinition(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: "rep-def-id",
    sportId: null,
    key: "rep_count",
    name: "Rep count",
    description: null,
    valueType: "number",
    canonicalUnit: "reps",
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    sport: null,
    ...overrides,
  };
}

function buildMetric(overrides: Partial<EventItemMetric> = {}): EventItemMetric {
  const metricDefinition = overrides.metricDefinition ?? buildMetricDefinition();

  return {
    id: "metric-1",
    eventItemId: "item-1",
    metricDefinitionId: metricDefinition.id,
    numericValue: "10",
    textValue: null,
    booleanValue: null,
    unit: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    metricDefinition,
    ...overrides,
  };
}

function buildItem(overrides: Partial<EventItem> = {}): EventItem {
  const eventItemType = overrides.eventItemType ?? buildItemType();

  return {
    id: "item-1",
    eventId: "event-1",
    eventItemTypeId: eventItemType.id,
    parentEventItemId: null,
    sortOrder: 0,
    label: null,
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    notes: null,
    structuredData: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    eventItemType,
    metrics: [],
    children: [],
    ...overrides,
  };
}

describe("pluralizeItemTypeName", () => {
  it("adds s to singular type names", () => {
    expect(pluralizeItemTypeName("Exercise")).toBe("Exercises");
    expect(pluralizeItemTypeName("Period")).toBe("Periods");
  });

  it("keeps names that already end in s", () => {
    expect(pluralizeItemTypeName("Sets")).toBe("Sets");
  });
});

describe("eventItemsSectionTitle", () => {
  it("uses the plural type name when every root item shares a type", () => {
    expect(
      eventItemsSectionTitle([buildItem({ id: "exercise-1" }), buildItem({ id: "exercise-2" })]),
    ).toBe("Exercises");
  });

  it("falls back to Details when root types are mixed", () => {
    expect(
      eventItemsSectionTitle([
        buildItem({
          id: "period-1",
          eventItemTypeId: "period-type-id",
          eventItemType: buildItemType({
            id: "period-type-id",
            slug: "period",
            name: "Period",
          }),
        }),
        buildItem({
          id: "shift-1",
          eventItemTypeId: "shift-type-id",
          eventItemType: buildItemType({
            id: "shift-type-id",
            slug: "shift",
            name: "Shift",
          }),
        }),
      ]),
    ).toBe("Details");
  });

  it("falls back to Details when there are no items", () => {
    expect(eventItemsSectionTitle([])).toBe("Details");
  });
});

describe("eventItemSameTypeIndex and eventItemTitle", () => {
  it("numbers unlabeled items among siblings of the same type", () => {
    const periodType = buildItemType({
      id: "period-type-id",
      slug: "period",
      name: "Period",
    });
    const shiftType = buildItemType({
      id: "shift-type-id",
      slug: "shift",
      name: "Shift",
    });
    const siblings = [
      buildItem({ id: "period-1", eventItemTypeId: periodType.id, eventItemType: periodType }),
      buildItem({ id: "shift-1", eventItemTypeId: shiftType.id, eventItemType: shiftType }),
      buildItem({ id: "period-2", eventItemTypeId: periodType.id, eventItemType: periodType }),
    ];

    expect(eventItemSameTypeIndex(siblings, 0)).toBe(1);
    expect(eventItemSameTypeIndex(siblings, 1)).toBe(1);
    expect(eventItemSameTypeIndex(siblings, 2)).toBe(2);
    expect(eventItemTitle(siblings[2]!, 2)).toBe("Period 2");
  });

  it("uses a trimmed label when present", () => {
    expect(eventItemTitle(buildItem({ label: "  Curls  " }), 1)).toBe("Curls");
  });
});

describe("shouldUseCompactItemMetrics and eventItemIsCollapsible", () => {
  it("uses a compact line for leaf items with up to three metrics", () => {
    const item = buildItem({
      metrics: [buildMetric(), buildMetric({ id: "metric-2" }), buildMetric({ id: "metric-3" })],
    });

    expect(shouldUseCompactItemMetrics(item)).toBe(true);
    expect(eventItemIsCollapsible(item)).toBe(false);
  });

  it("stacks and collapses items with more than three metrics", () => {
    const item = buildItem({
      metrics: [
        buildMetric(),
        buildMetric({ id: "metric-2" }),
        buildMetric({ id: "metric-3" }),
        buildMetric({ id: "metric-4" }),
      ],
    });

    expect(shouldUseCompactItemMetrics(item)).toBe(false);
    expect(eventItemIsCollapsible(item)).toBe(true);
  });

  it("collapses items that have children, notes, or times", () => {
    expect(eventItemIsCollapsible(buildItem({ children: [buildItem({ id: "child-1" })] }))).toBe(
      true,
    );
    expect(eventItemIsCollapsible(buildItem({ notes: "Felt strong" }))).toBe(true);
    expect(eventItemIsCollapsible(buildItem({ startedAt: timestamp }))).toBe(true);
    expect(eventItemIsCollapsible(buildItem({ durationSeconds: 60 }))).toBe(true);
  });

  it("stacks duration metrics so the name stays visible", () => {
    const item = buildItem({
      metrics: [
        buildMetric({
          numericValue: "1200",
          metricDefinition: buildMetricDefinition({
            id: "playing-time-def-id",
            key: "playing_time_seconds",
            name: "Playing time",
            canonicalUnit: "s",
          }),
        }),
      ],
    });

    expect(shouldUseCompactItemMetrics(item)).toBe(false);
    expect(eventItemIsCollapsible(item)).toBe(true);
  });
});

describe("formatEventItemMetricSummary", () => {
  it("joins values and units", () => {
    expect(
      formatEventItemMetricSummary([
        buildMetric(),
        buildMetric({
          id: "metric-2",
          numericValue: "20",
          metricDefinition: buildMetricDefinition({
            id: "load-def-id",
            key: "load_kg",
            name: "Load",
            canonicalUnit: "kg",
          }),
        }),
        buildMetric({
          id: "metric-3",
          numericValue: "7",
          metricDefinition: buildMetricDefinition({
            id: "rpe-def-id",
            key: "rpe",
            name: "RPE",
            canonicalUnit: "scale_1_10",
          }),
        }),
      ]),
    ).toBe("10 reps · 20 kg · RPE 7");
  });

  it("uses the metric name when the unit is a generic count", () => {
    expect(
      formatEventItemMetricSummary([
        buildMetric({
          numericValue: "3",
          metricDefinition: buildMetricDefinition({
            id: "hit-def-id",
            key: "hit_count",
            name: "Hit count",
            canonicalUnit: "count",
          }),
        }),
      ]),
    ).toBe("Hit count 3");
  });

  it("uses the metric name when the value is already a formatted duration", () => {
    expect(
      formatEventItemMetricSummary([
        buildMetric({
          numericValue: "1200",
          metricDefinition: buildMetricDefinition({
            id: "playing-time-def-id",
            key: "playing_time_seconds",
            name: "Playing time",
            canonicalUnit: "s",
          }),
        }),
      ]),
    ).toBe("Playing time 20 min");
  });
});

describe("formatEventItemCollapsedCounts", () => {
  it("summarizes metrics and child types", () => {
    const shiftType = buildItemType({
      id: "shift-type-id",
      slug: "shift",
      name: "Shift",
    });

    expect(
      formatEventItemCollapsedCounts(
        buildItem({
          metrics: [buildMetric(), buildMetric({ id: "metric-2" })],
          children: [
            buildItem({
              id: "shift-1",
              eventItemTypeId: shiftType.id,
              eventItemType: shiftType,
            }),
            buildItem({
              id: "shift-2",
              eventItemTypeId: shiftType.id,
              eventItemType: shiftType,
            }),
          ],
        }),
      ),
    ).toBe("2 metrics · 2 shifts");
  });

  it("uses singular labels for one metric or child", () => {
    const shiftType = buildItemType({
      id: "shift-type-id",
      slug: "shift",
      name: "Shift",
    });

    expect(
      formatEventItemCollapsedCounts(
        buildItem({
          metrics: [buildMetric()],
          children: [
            buildItem({
              id: "shift-1",
              eventItemTypeId: shiftType.id,
              eventItemType: shiftType,
            }),
          ],
        }),
      ),
    ).toBe("1 metric · 1 shift");
  });
});

describe("formatEventItemTimeRange", () => {
  it("formats a start and end in the given time zone", () => {
    expect(
      formatEventItemTimeRange(
        buildItem({
          startedAt: "2026-08-05T16:00:00.000Z",
          endedAt: "2026-08-05T16:20:00.000Z",
        }),
        "Europe/Helsinki",
      ),
    ).toBe("19:00 – 19:20");
  });

  it("returns null when no times are set", () => {
    expect(formatEventItemTimeRange(buildItem(), "Europe/Helsinki")).toBeNull();
  });

  it("includes dates when start and end are on different local days", () => {
    expect(
      formatEventItemTimeRange(
        buildItem({
          startedAt: "2026-08-05T20:00:00.000Z",
          endedAt: "2026-08-05T22:00:00.000Z",
        }),
        "Europe/Helsinki",
      ),
    ).toBe("Wed 5 Aug 23:00 – Thu 6 Aug 01:00");
  });
});
