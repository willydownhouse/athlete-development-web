import { describe, expect, it } from "vitest";

import { numericMetricsForSelectedEventTypes } from "./events-list-metrics";
import type { EventTypeMetricDefinition, MetricDefinition } from "./types";

function metric(
  overrides: Partial<MetricDefinition> & Pick<MetricDefinition, "id" | "name" | "key">,
): MetricDefinition {
  return {
    sportId: null,
    description: null,
    valueType: "number",
    canonicalUnit: null,
    active: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    sport: null,
    ...overrides,
  };
}

function mapping(
  eventTypeId: string,
  metricDefinition: MetricDefinition,
): EventTypeMetricDefinition {
  return {
    id: `${eventTypeId}-${metricDefinition.id}`,
    eventTypeId,
    metricDefinitionId: metricDefinition.id,
    required: false,
    sortOrder: 10,
    metricDefinition,
  };
}

const icePracticeId = "00000000-0000-4000-8000-000000000201";
const gameId = "00000000-0000-4000-8000-000000000209";
const shotCount = metric({
  id: "00000000-0000-4000-8000-000000000401",
  key: "shot_count",
  name: "Shot count",
  canonicalUnit: "shots",
});
const plusMinus = metric({
  id: "00000000-0000-4000-8000-000000000402",
  key: "plus_minus",
  name: "Plus minus",
});
const teamName = metric({
  id: "00000000-0000-4000-8000-000000000403",
  key: "team_name",
  name: "Team name",
  valueType: "text",
});

describe("numericMetricsForSelectedEventTypes", () => {
  const mappings = [
    mapping(icePracticeId, shotCount),
    mapping(gameId, shotCount),
    mapping(gameId, plusMinus),
    mapping(gameId, teamName),
  ];

  it("returns numeric metrics for all mappings when no types are selected", () => {
    expect(numericMetricsForSelectedEventTypes(mappings, []).map((item) => item.key)).toEqual([
      "plus_minus",
      "shot_count",
    ]);
  });

  it("returns the union of numeric metrics for selected types", () => {
    expect(
      numericMetricsForSelectedEventTypes(mappings, [icePracticeId]).map((item) => item.key),
    ).toEqual(["shot_count"]);
    expect(
      numericMetricsForSelectedEventTypes(mappings, [icePracticeId, gameId]).map(
        (item) => item.key,
      ),
    ).toEqual(["plus_minus", "shot_count"]);
  });
});
