import { describe, expect, it } from "vitest";

import { formatDurationSeconds, formatEventMetricValue } from "./event-metric-display";
import type { EventMetric, MetricDefinition } from "./types";

function buildMetricDefinition(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: "metric-def-1",
    sportId: null,
    key: "shot_count",
    name: "Shot count",
    description: "Number of hockey shots taken.",
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

describe("formatDurationSeconds", () => {
  it("formats short durations in seconds", () => {
    expect(formatDurationSeconds(45)).toBe("45s");
  });

  it("formats minute durations", () => {
    expect(formatDurationSeconds(75)).toBe("1m 15s");
    expect(formatDurationSeconds(3600)).toBe("1h");
    expect(formatDurationSeconds(5400)).toBe("1h 30m");
  });
});

describe("formatEventMetricValue", () => {
  it("formats numeric metrics with units", () => {
    const metric = buildMetric(buildMetricDefinition(), { numericValue: "100" });

    expect(formatEventMetricValue(metric)).toBe("100 shots");
  });

  it("formats seconds metrics as durations", () => {
    const metric = buildMetric(buildMetricDefinition({ canonicalUnit: "s", name: "Duration" }), {
      numericValue: "3665",
    });

    expect(formatEventMetricValue(metric)).toBe("1h 1m");
  });

  it("formats boolean and text metrics", () => {
    const booleanMetric = buildMetric(
      buildMetricDefinition({ valueType: "boolean", name: "Completed" }),
      {
        booleanValue: true,
      },
    );
    const textMetric = buildMetric(buildMetricDefinition({ valueType: "text", name: "Notes" }), {
      textValue: "Good session",
    });

    expect(formatEventMetricValue(booleanMetric)).toBe("Yes");
    expect(formatEventMetricValue(textMetric)).toBe("Good session");
  });
});
