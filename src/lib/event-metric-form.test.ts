import { describe, expect, it } from "vitest";

import {
  durationPartsToSeconds,
  eventMetricsToFormValues,
  metricDurationFieldName,
  metricFieldName,
  parseEventMetricsFromFormData,
  parseMetricInputsWithPrefix,
  parseMetricsFromFormData,
  validateEventMetricPayloadForm,
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

  it("validates RPE metrics must be between 1 and 10", () => {
    const mapping = buildMapping(
      { metricDefinitionId: "rpe-metric" },
      {
        id: "rpe-metric",
        key: "rpe",
        name: "RPE",
        valueType: "number",
        canonicalUnit: "scale_1_10",
        description: "Rating of perceived exertion on a 1-10 scale.",
      },
    );
    const formData = new FormData();
    formData.set(metricFieldName("rpe-metric"), "11");

    expect(validateMetricForm(formData, [mapping])).toBe("RPE must be between 1 and 10");
  });

  it("accepts valid optional RPE metrics", () => {
    const mapping = buildMapping(
      { metricDefinitionId: "rpe-metric" },
      {
        id: "rpe-metric",
        key: "rpe",
        name: "RPE",
        valueType: "number",
        canonicalUnit: "scale_1_10",
      },
    );
    const formData = new FormData();
    formData.set(metricFieldName("rpe-metric"), "7");

    expect(validateMetricForm(formData, [mapping])).toBeNull();
  });
});

describe("parseEventMetricsFromFormData", () => {
  it("parses event metrics without a catalog", () => {
    const formData = new FormData();
    formData.set(metricFieldName("number-metric-id"), "42");
    formData.set(metricFieldName("text-metric-id"), "note");
    formData.set(metricFieldName("bool-metric-id"), "on");
    formData.set(metricDurationFieldName("duration-metric-id", "hours"), "0");
    formData.set(metricDurationFieldName("duration-metric-id", "minutes"), "5");
    formData.set(metricDurationFieldName("duration-metric-id", "seconds"), "30");

    expect(parseEventMetricsFromFormData(formData)).toEqual([
      { metricDefinitionId: "duration-metric-id", numericValue: durationPartsToSeconds(0, 5, 30) },
      { metricDefinitionId: "number-metric-id", numericValue: 42 },
      { metricDefinitionId: "text-metric-id", textValue: "note" },
      { metricDefinitionId: "bool-metric-id", booleanValue: true },
    ]);
  });

  it("parses prefixed set metrics without a catalog", () => {
    const prefix = "items[0].children[0].metric.";
    const formData = new FormData();
    formData.set(`${prefix}rep-metric-id`, "12");

    expect(parseMetricInputsWithPrefix(formData, prefix)).toEqual([
      { metricDefinitionId: "rep-metric-id", numericValue: 12 },
    ]);
  });
});

describe("validateEventMetricPayloadForm", () => {
  it("reports text metric names when a numeric string would be parsed incorrectly", () => {
    const mapping = buildMapping(
      {},
      {
        id: "team-name-metric",
        key: "team_name",
        name: "Team name",
        valueType: "text",
        canonicalUnit: null,
      },
    );
    const formData = new FormData();
    formData.set(metricFieldName("team-name-metric"), "123");

    expect(validateEventMetricPayloadForm(formData, [mapping])).toBe("Team name must be text");
  });
});
