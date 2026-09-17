import { describe, expect, it } from "vitest";

import {
  itemMeasureChildNoun,
  itemMeasureNumericMetricsFromCatalog,
  numericMetricsForEventsListMeasure,
  numericMetricsForSelectedEventTypes,
  numericMetricsFromItemTypeMappings,
} from "./events-list-metrics";
import type {
  EventItemType,
  EventItemTypeChildType,
  EventItemTypeMetricDefinition,
  EventTypeMetricDefinition,
  MetricDefinition,
} from "./types";

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

describe("numericMetricsForEventsListMeasure", () => {
  const mappings = [mapping(icePracticeId, shotCount), mapping(gameId, plusMinus)];
  const repCount = metric({
    id: "00000000-0000-4000-8000-000000000417",
    key: "rep_count",
    name: "Rep count",
    canonicalUnit: "reps",
  });
  const itemMeasureMetrics = {
    warm_up: [],
    cool_down: [],
    exercise: [repCount],
  };

  it("keeps item metrics when event types change", () => {
    expect(
      numericMetricsForEventsListMeasure("exercise", itemMeasureMetrics, mappings, [
        icePracticeId,
      ]).map((item) => item.id),
    ).toEqual([repCount.id]);
  });

  it("scopes event metrics to the selected event types", () => {
    expect(
      numericMetricsForEventsListMeasure("events", itemMeasureMetrics, mappings, [
        icePracticeId,
      ]).map((item) => item.key),
    ).toEqual(["shot_count"]);
  });
});

describe("numericMetricsFromItemTypeMappings", () => {
  it("returns unique numeric metrics across item-type mappings", () => {
    const exerciseId = "00000000-0000-4000-8000-000000000601";
    const setId = "00000000-0000-4000-8000-000000000602";
    const repCount = metric({
      id: "00000000-0000-4000-8000-000000000417",
      key: "rep_count",
      name: "Rep count",
      canonicalUnit: "reps",
    });
    const note = metric({
      id: "00000000-0000-4000-8000-000000000418",
      key: "set_note",
      name: "Set note",
      valueType: "text",
    });

    function itemMapping(
      eventItemTypeId: string,
      metricDefinition: MetricDefinition,
    ): EventItemTypeMetricDefinition {
      return {
        id: `${eventItemTypeId}-${metricDefinition.id}`,
        eventItemTypeId,
        metricDefinitionId: metricDefinition.id,
        required: false,
        sortOrder: 10,
        metricDefinition,
      };
    }

    expect(
      numericMetricsFromItemTypeMappings([
        itemMapping(exerciseId, repCount),
        itemMapping(setId, repCount),
        itemMapping(setId, note),
      ]).map((item) => item.key),
    ).toEqual(["rep_count"]);
  });
});

describe("itemMeasureNumericMetricsFromCatalog", () => {
  it("includes descendant numeric metrics for exercise", () => {
    const warmUpId = "00000000-0000-4000-8000-000000000605";
    const exerciseId = "00000000-0000-4000-8000-000000000601";
    const setId = "00000000-0000-4000-8000-000000000602";
    const distance = metric({
      id: "00000000-0000-4000-8000-000000000301",
      key: "distance_meters",
      name: "Distance",
      canonicalUnit: "m",
    });
    const repCount = metric({
      id: "00000000-0000-4000-8000-000000000417",
      key: "rep_count",
      name: "Rep count",
      canonicalUnit: "reps",
    });

    function itemType(id: string, slug: string, name: string): EventItemType {
      return {
        id,
        sportId: null,
        slug,
        name,
        active: true,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
        sport: null,
      };
    }

    function itemMapping(
      eventItemTypeId: string,
      metricDefinition: MetricDefinition,
    ): EventItemTypeMetricDefinition {
      return {
        id: `${eventItemTypeId}-${metricDefinition.id}`,
        eventItemTypeId,
        metricDefinitionId: metricDefinition.id,
        required: false,
        sortOrder: 10,
        metricDefinition,
      };
    }

    const childTypes: EventItemTypeChildType[] = [
      {
        id: "child-exercise-set",
        parentEventItemTypeId: exerciseId,
        childEventItemTypeId: setId,
        sortOrder: 10,
        childEventItemType: itemType(setId, "set", "Set"),
      },
    ];

    const result = itemMeasureNumericMetricsFromCatalog(
      [
        itemType(warmUpId, "warm_up", "Warm-up"),
        itemType(exerciseId, "exercise", "Exercise"),
        itemType(setId, "set", "Set"),
      ],
      [itemMapping(warmUpId, distance), itemMapping(setId, repCount)],
      childTypes,
    );

    expect(result.warm_up.map((item) => item.key)).toEqual(["distance_meters"]);
    expect(result.exercise.map((item) => item.key)).toEqual(["rep_count"]);
    expect(result.cool_down).toEqual([]);
    expect(
      itemMeasureChildNoun(
        "exercise",
        [
          itemType(warmUpId, "warm_up", "Warm-up"),
          itemType(exerciseId, "exercise", "Exercise"),
          itemType(setId, "set", "Set"),
        ],
        childTypes,
      ),
    ).toBe("set");
    expect(
      itemMeasureChildNoun("warm_up", [itemType(warmUpId, "warm_up", "Warm-up")], childTypes),
    ).toBeUndefined();
  });
});
