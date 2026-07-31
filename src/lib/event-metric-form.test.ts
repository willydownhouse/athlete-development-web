import { describe, expect, it } from "vitest";

import {
  durationPartsToSeconds,
  eventMetricsToFormValues,
  metricDurationFieldName,
  metricFieldName,
  parseMetricsFromFormData,
  validateMetricForm,
} from "./event-metric-form";
import type { EventMetric, EventTypeMetricDefinition, MetricDefinition } from "./types";

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

function buildMapping(
  overrides: Partial<EventTypeMetricDefinition> = {},
  metricOverrides: Partial<MetricDefinition> = {},
): EventTypeMetricDefinition {
  const metricDefinition = buildMetricDefinition(metricOverrides);

  return {
    id: "mapping-1",
    eventTypeId: "event-type-1",
    metricDefinitionId: metricDefinition.id,
    required: false,
    sortOrder: 10,
    metricDefinition,
    ...overrides,
  };
}

function buildSavedMetric(
  mapping: EventTypeMetricDefinition,
  overrides: Partial<EventMetric> = {},
): EventMetric {
  return {
    id: "event-metric-1",
    eventId: "event-1",
    metricDefinitionId: mapping.metricDefinitionId,
    numericValue: "100",
    textValue: null,
    booleanValue: null,
    unit: null,
    createdAt: "2026-07-31T10:00:00.000Z",
    updatedAt: "2026-07-31T10:00:00.000Z",
    metricDefinition: mapping.metricDefinition,
    ...overrides,
  };
}

describe("eventMetricsToFormValues", () => {
  it("maps saved metrics to form values by value type", () => {
    const numberMapping = buildMapping({}, { id: "number-metric", valueType: "number" });
    const textMapping = buildMapping(
      { id: "mapping-text", metricDefinitionId: "text-metric", sortOrder: 20 },
      { id: "text-metric", key: "note", name: "Note", valueType: "text", canonicalUnit: null },
    );
    const booleanMapping = buildMapping(
      { id: "mapping-bool", metricDefinitionId: "bool-metric", sortOrder: 30 },
      {
        id: "bool-metric",
        key: "completed",
        name: "Completed",
        valueType: "boolean",
        canonicalUnit: null,
        description: null,
      },
    );

    const values = eventMetricsToFormValues(
      [numberMapping, textMapping, booleanMapping],
      [
        buildSavedMetric(numberMapping),
        buildSavedMetric(textMapping, {
          metricDefinitionId: "text-metric",
          numericValue: null,
          textValue: "Good session",
        }),
        buildSavedMetric(booleanMapping, {
          metricDefinitionId: "bool-metric",
          numericValue: null,
          booleanValue: true,
        }),
      ],
    );

    expect(values).toEqual({
      "number-metric": "100",
      "text-metric": "Good session",
      "bool-metric": "on",
    });
  });
});

describe("parseMetricsFromFormData", () => {
  it("builds API metric payloads from form fields", () => {
    const numberMapping = buildMapping({}, { id: "number-metric", valueType: "number" });
    const booleanMapping = buildMapping(
      { id: "mapping-bool", metricDefinitionId: "bool-metric" },
      {
        id: "bool-metric",
        key: "completed",
        name: "Completed",
        valueType: "boolean",
        canonicalUnit: null,
        description: null,
      },
    );

    const formData = new FormData();
    formData.set(metricFieldName("number-metric"), "50");
    formData.set(metricFieldName("bool-metric"), "on");

    expect(parseMetricsFromFormData(formData, [numberMapping, booleanMapping])).toEqual([
      { metricDefinitionId: "number-metric", numericValue: 50 },
      { metricDefinitionId: "bool-metric", booleanValue: true },
    ]);
  });

  it("omits empty optional metrics", () => {
    const mapping = buildMapping({}, { id: "number-metric", valueType: "number" });
    const formData = new FormData();

    expect(parseMetricsFromFormData(formData, [mapping])).toEqual([]);
  });
});

describe("seconds metrics", () => {
  it("splits saved seconds into hours, minutes, and seconds fields", () => {
    const mapping = buildMapping(
      { metricDefinitionId: "seconds-metric" },
      {
        id: "seconds-metric",
        key: "playing_time_seconds",
        name: "Playing time",
        valueType: "number",
        canonicalUnit: "s",
      },
    );

    const values = eventMetricsToFormValues(
      [mapping],
      [
        buildSavedMetric(mapping, {
          metricDefinitionId: "seconds-metric",
          numericValue: "3661",
        }),
      ],
    );

    expect(values).toEqual({
      "metric.seconds-metric.hours": "1",
      "metric.seconds-metric.minutes": "1",
      "metric.seconds-metric.seconds": "1",
    });
  });

  it("converts duration fields to total seconds for the API", () => {
    const mapping = buildMapping(
      { metricDefinitionId: "seconds-metric" },
      {
        id: "seconds-metric",
        key: "playing_time_seconds",
        name: "Playing time",
        valueType: "number",
        canonicalUnit: "s",
      },
    );
    const formData = new FormData();
    formData.set(metricDurationFieldName("seconds-metric", "hours"), "1");
    formData.set(metricDurationFieldName("seconds-metric", "minutes"), "2");
    formData.set(metricDurationFieldName("seconds-metric", "seconds"), "3");

    expect(parseMetricsFromFormData(formData, [mapping])).toEqual([
      {
        metricDefinitionId: "seconds-metric",
        numericValue: durationPartsToSeconds(1, 2, 3),
      },
    ]);
  });

  it("validates required seconds metrics", () => {
    const mapping = buildMapping(
      { required: true, metricDefinitionId: "seconds-metric" },
      {
        id: "seconds-metric",
        key: "playing_time_seconds",
        name: "Playing time",
        valueType: "number",
        canonicalUnit: "s",
      },
    );
    const formData = new FormData();

    expect(validateMetricForm(formData, [mapping])).toBe("Playing time is required");
  });
});

describe("validateMetricForm", () => {
  it("requires configured required metrics", () => {
    const mapping = buildMapping({ required: true }, { id: "number-metric", valueType: "number" });
    const formData = new FormData();

    expect(validateMetricForm(formData, [mapping])).toBe("Shot count is required");
  });

  it("validates numeric metrics", () => {
    const mapping = buildMapping({ required: true }, { id: "number-metric", valueType: "number" });
    const formData = new FormData();
    formData.set(metricFieldName("number-metric"), "not-a-number");

    expect(validateMetricForm(formData, [mapping])).toBe("Shot count must be a number");
  });
});
