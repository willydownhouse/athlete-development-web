import { describe, expect, it } from "vitest";

import {
  eventsAggregateHeading,
  formatEventsAggregateCoverage,
  formatEventsAggregateTotal,
} from "./events-aggregate-format";
import type { EventAggregate } from "./types";

function aggregate(overrides: Partial<EventAggregate>): EventAggregate {
  return {
    athleteId: "22222222-2222-4222-8222-222222222222",
    aggregation: "count",
    metricDefinitionId: null,
    canonicalUnit: null,
    total: 8,
    matchingEventCount: 8,
    eventsWithValue: 8,
    ...overrides,
  };
}

describe("eventsAggregateHeading", () => {
  it("labels count and duration totals", () => {
    expect(eventsAggregateHeading("count")).toBe("Event count");
    expect(eventsAggregateHeading("durationSeconds")).toBe("Total duration");
    expect(eventsAggregateHeading("metric")).toBe("Metric total");
    expect(eventsAggregateHeading("metricAverage")).toBe("Metric average");
  });
});

describe("formatEventsAggregateTotal", () => {
  it("formats a duration total as hours and minutes", () => {
    expect(
      formatEventsAggregateTotal(
        aggregate({
          aggregation: "durationSeconds",
          canonicalUnit: "s",
          total: 5400,
        }),
      ),
    ).toBe("1h 30m");
  });

  it("formats a seconds metric total as hours, minutes, and seconds", () => {
    expect(
      formatEventsAggregateTotal(
        aggregate({
          aggregation: "metric",
          metricDefinitionId: "00000000-0000-4000-8000-000000000401",
          canonicalUnit: "s",
          total: 75,
        }),
      ),
    ).toBe("1m 15s");
    expect(
      formatEventsAggregateTotal(
        aggregate({
          aggregation: "metric",
          metricDefinitionId: "00000000-0000-4000-8000-000000000401",
          canonicalUnit: "s",
          total: 45,
        }),
      ),
    ).toBe("45s");
  });

  it("formats a metric total with its unit", () => {
    expect(
      formatEventsAggregateTotal(
        aggregate({
          aggregation: "metric",
          metricDefinitionId: "00000000-0000-4000-8000-000000000402",
          canonicalUnit: "goals",
          total: 14,
        }),
      ),
    ).toBe("14 goals");
  });

  it("formats a metric average with one decimal", () => {
    expect(
      formatEventsAggregateTotal(
        aggregate({
          aggregation: "metricAverage",
          metricDefinitionId: "00000000-0000-4000-8000-000000000402",
          canonicalUnit: "scale_1_10",
          total: 6.5,
        }),
      ),
    ).toBe("6.5");
  });

  it("formats a count total", () => {
    expect(formatEventsAggregateTotal(aggregate({ total: 8 }))).toBe("8");
  });
});

describe("formatEventsAggregateCoverage", () => {
  it("reports matching events for a complete count", () => {
    expect(
      formatEventsAggregateCoverage(aggregate({ matchingEventCount: 1, eventsWithValue: 1 })),
    ).toBe("1 event");
  });

  it("reports incomplete duration coverage", () => {
    expect(
      formatEventsAggregateCoverage(
        aggregate({
          aggregation: "durationSeconds",
          matchingEventCount: 8,
          eventsWithValue: 6,
        }),
      ),
    ).toBe("6 of 8 events had a duration");
  });

  it("reports incomplete metric coverage", () => {
    expect(
      formatEventsAggregateCoverage(
        aggregate({
          aggregation: "metric",
          matchingEventCount: 8,
          eventsWithValue: 6,
        }),
      ),
    ).toBe("6 of 8 events had a value");
  });
});
