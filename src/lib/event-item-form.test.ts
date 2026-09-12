import { describe, expect, it } from "vitest";

import {
  EVENT_ITEMS_MAX_ROOT_ITEMS,
  eventItemFormSectionTitle,
  eventItemsToFormDrafts,
  eventItemsToInputs,
  eventItemTypeAllowsMultiple,
  filterAddableItemTypes,
  itemFieldName,
  itemMetricFieldName,
  itemMetricValueTypeFieldName,
  parseEventItemsFromFormData,
  shouldUseCompactItemMetricFields,
  validateEventItemsForm,
  type EventItemFormCatalog,
} from "./event-item-form";
import { BOOLEAN_METRIC_SAVED_VALUE, booleanMetricSavedFieldName } from "./event-metric-form";
import type { EventItem, EventItemTypeMetricDefinition } from "./types";

const setMetrics: EventItemTypeMetricDefinition[] = [
  {
    id: "mapping-reps",
    eventItemTypeId: "set-type-id",
    metricDefinitionId: "rep-metric-id",
    required: false,
    sortOrder: 10,
    metricDefinition: {
      id: "rep-metric-id",
      sportId: null,
      key: "rep_count",
      name: "Rep count",
      description: null,
      valueType: "number",
      canonicalUnit: "reps",
      active: true,
      createdAt: "2026-08-05T10:00:00.000Z",
      updatedAt: "2026-08-05T10:00:00.000Z",
      sport: null,
    },
  },
  {
    id: "mapping-load",
    eventItemTypeId: "set-type-id",
    metricDefinitionId: "load-metric-id",
    required: false,
    sortOrder: 20,
    metricDefinition: {
      id: "load-metric-id",
      sportId: null,
      key: "load_kg",
      name: "Load",
      description: null,
      valueType: "number",
      canonicalUnit: "kg",
      active: true,
      createdAt: "2026-08-05T10:00:00.000Z",
      updatedAt: "2026-08-05T10:00:00.000Z",
      sport: null,
    },
  },
];

const catalog: EventItemFormCatalog = {
  roots: [
    {
      eventItemTypeId: "exercise-type-id",
      name: "Exercise",
      slug: "exercise",
      required: false,
      sortOrder: 10,
      metrics: [],
      children: [
        {
          eventItemTypeId: "set-type-id",
          name: "Set",
          slug: "set",
          required: false,
          sortOrder: 10,
          metrics: setMetrics,
          children: [],
        },
      ],
    },
  ],
};

const gameCatalog: EventItemFormCatalog = {
  roots: [
    {
      eventItemTypeId: "period-type-id",
      name: "Period",
      slug: "period",
      required: false,
      sortOrder: 10,
      metrics: [],
      children: [
        {
          eventItemTypeId: "shift-type-id",
          name: "Shift",
          slug: "shift",
          required: false,
          sortOrder: 10,
          metrics: [
            {
              id: "mapping-hits",
              eventItemTypeId: "shift-type-id",
              metricDefinitionId: "hit-metric-id",
              required: false,
              sortOrder: 10,
              metricDefinition: {
                id: "hit-metric-id",
                sportId: null,
                key: "hit_count",
                name: "Hit count",
                description: null,
                valueType: "number",
                canonicalUnit: "count",
                active: true,
                createdAt: "2026-08-05T10:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
                sport: null,
              },
            },
          ],
          children: [],
        },
      ],
    },
    {
      eventItemTypeId: "shift-type-id",
      name: "Shift",
      slug: "shift",
      required: false,
      sortOrder: 20,
      metrics: [],
      children: [],
    },
  ],
};

function sampleExercise(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: "exercise-1",
    eventId: "event-1",
    eventItemTypeId: "exercise-type-id",
    parentEventItemId: null,
    sortOrder: 0,
    label: "Curls",
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    notes: null,
    structuredData: null,
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    eventItemType: {
      id: "exercise-type-id",
      sportId: null,
      slug: "exercise",
      name: "Exercise",
      active: true,
      createdAt: "2026-08-05T10:00:00.000Z",
      updatedAt: "2026-08-05T10:00:00.000Z",
      sport: null,
    },
    metrics: [],
    children: [],
    ...overrides,
  };
}

describe("parseEventItemsFromFormData", () => {
  it("builds exercise and set items from form fields", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "eventItemTypeId"), "exercise-type-id");
    formData.set(itemFieldName([0], "label"), "Curls");
    formData.set(itemFieldName([0, 0], "eventItemTypeId"), "set-type-id");
    formData.set(itemMetricFieldName([0, 0], "rep-metric-id"), "10");
    formData.set(itemMetricFieldName([0, 0], "load-metric-id"), "20");
    formData.set(itemFieldName([0, 1], "eventItemTypeId"), "set-type-id");
    formData.set(itemMetricFieldName([0, 1], "rep-metric-id"), "8");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        eventItemTypeId: "exercise-type-id",
        label: "Curls",
        children: [
          {
            eventItemTypeId: "set-type-id",
            metrics: [
              { metricDefinitionId: "rep-metric-id", numericValue: 10 },
              { metricDefinitionId: "load-metric-id", numericValue: 20 },
            ],
          },
          {
            eventItemTypeId: "set-type-id",
            metrics: [{ metricDefinitionId: "rep-metric-id", numericValue: 8 }],
          },
        ],
      },
    ]);
  });

  it("skips empty items", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "eventItemTypeId"), "exercise-type-id");
    formData.set(itemFieldName([0], "label"), "  ");

    expect(parseEventItemsFromFormData(formData)).toEqual([]);
  });

  it("includes existing item ids and passthrough fields", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "id"), "exercise-1");
    formData.set(itemFieldName([0], "eventItemTypeId"), "exercise-type-id");
    formData.set(itemFieldName([0], "label"), "Curls");
    formData.set(itemFieldName([0], "notes"), "Felt strong");
    formData.set(itemFieldName([0, 0], "id"), "set-1");
    formData.set(itemFieldName([0, 0], "eventItemTypeId"), "set-type-id");
    formData.set(itemMetricFieldName([0, 0], "rep-metric-id"), "10");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        id: "exercise-1",
        eventItemTypeId: "exercise-type-id",
        label: "Curls",
        notes: "Felt strong",
        children: [
          {
            id: "set-1",
            eventItemTypeId: "set-type-id",
            metrics: [{ metricDefinitionId: "rep-metric-id", numericValue: 10 }],
          },
        ],
      },
    ]);
  });

  it("keeps an existing item that has no edited fields", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "id"), "period-1");
    formData.set(itemFieldName([0], "eventItemTypeId"), "period-type-id");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        id: "period-1",
        eventItemTypeId: "period-type-id",
      },
    ]);
  });

  it("parses a period with a timed shift", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "eventItemTypeId"), "period-type-id");
    formData.set(itemFieldName([0], "label"), "Period 1");
    formData.set(itemFieldName([0, 0], "eventItemTypeId"), "shift-type-id");
    formData.set(itemFieldName([0, 0], "durationSeconds"), "46");
    formData.set(itemMetricFieldName([0, 0], "hit-metric-id"), "3");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        eventItemTypeId: "period-type-id",
        label: "Period 1",
        children: [
          {
            eventItemTypeId: "shift-type-id",
            durationSeconds: 46,
            metrics: [{ metricDefinitionId: "hit-metric-id", numericValue: 3 }],
          },
        ],
      },
    ]);
  });

  it("keeps a saved false boolean metric on update", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "id"), "period-1");
    formData.set(itemFieldName([0], "eventItemTypeId"), "period-type-id");
    formData.set(itemMetricValueTypeFieldName([0], "power-play-metric-id"), "boolean");
    formData.set(
      booleanMetricSavedFieldName(itemMetricFieldName([0], "power-play-metric-id")),
      BOOLEAN_METRIC_SAVED_VALUE,
    );

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        id: "period-1",
        eventItemTypeId: "period-type-id",
        metrics: [{ metricDefinitionId: "power-play-metric-id", booleanValue: false }],
      },
    ]);
  });

  it("omits an optional boolean item metric that was never saved", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "id"), "period-1");
    formData.set(itemFieldName([0], "eventItemTypeId"), "period-type-id");
    formData.set(itemMetricValueTypeFieldName([0], "power-play-metric-id"), "boolean");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        id: "period-1",
        eventItemTypeId: "period-type-id",
      },
    ]);
  });

  it("uses submitted value type metadata for text metrics", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "eventItemTypeId"), "exercise-type-id");
    formData.set(itemFieldName([0], "label"), "Curls");
    formData.set(itemFieldName([0, 0], "eventItemTypeId"), "set-type-id");
    formData.set(itemMetricValueTypeFieldName([0, 0], "note-metric-id"), "text");
    formData.set(itemMetricFieldName([0, 0], "note-metric-id"), "123");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        eventItemTypeId: "exercise-type-id",
        label: "Curls",
        children: [
          {
            eventItemTypeId: "set-type-id",
            metrics: [{ metricDefinitionId: "note-metric-id", textValue: "123" }],
          },
        ],
      },
    ]);
  });
});

describe("validateEventItemsForm", () => {
  it("rejects too many root items", () => {
    const formData = new FormData();

    for (let index = 0; index < EVENT_ITEMS_MAX_ROOT_ITEMS + 1; index += 1) {
      formData.set(itemFieldName([index], "eventItemTypeId"), "exercise-type-id");
      formData.set(itemFieldName([index], "label"), `Exercise ${index + 1}`);
    }

    expect(validateEventItemsForm(formData, catalog)).toBe(
      `Events can include at most ${EVENT_ITEMS_MAX_ROOT_ITEMS} top-level items`,
    );
  });

  it("rejects a label that is too long", () => {
    const formData = new FormData();
    formData.set(itemFieldName([0], "eventItemTypeId"), "exercise-type-id");
    formData.set(itemFieldName([0], "label"), "x".repeat(101));

    expect(validateEventItemsForm(formData, catalog)).toBe(
      "Exercise 1 · Name must be 100 characters or less",
    );
  });
});

describe("eventItemsToFormDrafts", () => {
  it("maps a saved false boolean item metric to an explicit unchecked value", () => {
    const booleanCatalog: EventItemFormCatalog = {
      roots: [
        {
          eventItemTypeId: "period-type-id",
          name: "Period",
          slug: "period",
          required: false,
          sortOrder: 10,
          metrics: [
            {
              id: "mapping-power-play",
              eventItemTypeId: "period-type-id",
              metricDefinitionId: "power-play-metric-id",
              required: false,
              sortOrder: 10,
              metricDefinition: {
                id: "power-play-metric-id",
                sportId: null,
                key: "power_play",
                name: "Power play",
                description: null,
                valueType: "boolean",
                canonicalUnit: null,
                active: true,
                createdAt: "2026-08-05T10:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
                sport: null,
              },
            },
          ],
          children: [],
        },
      ],
    };

    expect(
      eventItemsToFormDrafts(
        [
          {
            id: "period-1",
            eventId: "event-1",
            eventItemTypeId: "period-type-id",
            parentEventItemId: null,
            sortOrder: 0,
            label: "1st",
            startedAt: null,
            endedAt: null,
            durationSeconds: null,
            notes: null,
            structuredData: null,
            createdAt: "2026-08-05T10:00:00.000Z",
            updatedAt: "2026-08-05T10:00:00.000Z",
            eventItemType: {
              id: "period-type-id",
              sportId: null,
              slug: "period",
              name: "Period",
              active: true,
              createdAt: "2026-08-05T10:00:00.000Z",
              updatedAt: "2026-08-05T10:00:00.000Z",
              sport: null,
            },
            metrics: [
              {
                id: "metric-1",
                eventItemId: "period-1",
                metricDefinitionId: "power-play-metric-id",
                numericValue: null,
                textValue: null,
                booleanValue: false,
                unit: null,
                createdAt: "2026-08-05T10:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
                metricDefinition: booleanCatalog.roots[0]!.metrics[0]!.metricDefinition,
              },
            ],
            children: [],
          },
        ],
        booleanCatalog,
      ),
    ).toEqual([
      {
        key: "period-1",
        id: "period-1",
        eventItemTypeId: "period-type-id",
        label: "1st",
        durationHours: "",
        durationMinutes: "",
        durationSeconds: "",
        metricValues: { "power-play-metric-id": "off" },
        notes: "",
        startedAt: "",
        endedAt: "",
        structuredData: "",
        children: [],
      },
    ]);
  });

  it("keeps saved exercise and set ids", () => {
    expect(
      eventItemsToFormDrafts(
        [
          sampleExercise({
            children: [
              {
                id: "set-1",
                eventId: "event-1",
                eventItemTypeId: "set-type-id",
                parentEventItemId: "exercise-1",
                sortOrder: 0,
                label: null,
                startedAt: null,
                endedAt: null,
                durationSeconds: null,
                notes: null,
                structuredData: null,
                createdAt: "2026-08-05T10:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
                eventItemType: {
                  id: "set-type-id",
                  sportId: null,
                  slug: "set",
                  name: "Set",
                  active: true,
                  createdAt: "2026-08-05T10:00:00.000Z",
                  updatedAt: "2026-08-05T10:00:00.000Z",
                  sport: null,
                },
                metrics: [
                  {
                    id: "metric-1",
                    eventItemId: "set-1",
                    metricDefinitionId: "rep-metric-id",
                    numericValue: "10",
                    textValue: null,
                    booleanValue: null,
                    unit: null,
                    createdAt: "2026-08-05T10:00:00.000Z",
                    updatedAt: "2026-08-05T10:00:00.000Z",
                    metricDefinition: setMetrics[0]!.metricDefinition,
                  },
                ],
                children: [],
              },
            ],
          }),
        ],
        catalog,
      ),
    ).toEqual([
      {
        key: "exercise-1",
        id: "exercise-1",
        eventItemTypeId: "exercise-type-id",
        label: "Curls",
        durationHours: "",
        durationMinutes: "",
        durationSeconds: "",
        metricValues: {},
        notes: "",
        startedAt: "",
        endedAt: "",
        structuredData: "",
        children: [
          {
            key: "set-1",
            id: "set-1",
            eventItemTypeId: "set-type-id",
            label: "",
            durationHours: "",
            durationMinutes: "",
            durationSeconds: "",
            metricValues: { "rep-metric-id": "10" },
            notes: "",
            startedAt: "",
            endedAt: "",
            structuredData: "",
            children: [],
          },
        ],
      },
    ]);
  });
});

describe("eventItemFormSectionTitle", () => {
  it("uses the plural type name when every root is the same type", () => {
    expect(eventItemFormSectionTitle(catalog.roots)).toBe("Exercises");
  });

  it("uses Details when root types differ", () => {
    expect(eventItemFormSectionTitle(gameCatalog.roots)).toBe("Details");
  });
});

describe("filterAddableItemTypes", () => {
  const warmUpType = {
    eventItemTypeId: "warm-up-type-id",
    name: "Warm-up",
    slug: "warm_up",
    required: false,
    sortOrder: 5,
    metrics: [],
    children: [],
  };
  const coolDownType = {
    eventItemTypeId: "cool-down-type-id",
    name: "Cool-down",
    slug: "cool_down",
    required: false,
    sortOrder: 20,
    metrics: [],
    children: [],
  };
  const exerciseType = catalog.roots[0]!;

  it("hides warm-up and cool-down after one of that type exists", () => {
    expect(eventItemTypeAllowsMultiple("warm_up")).toBe(false);
    expect(eventItemTypeAllowsMultiple("exercise")).toBe(true);
    expect(
      filterAddableItemTypes(
        [warmUpType, exerciseType, coolDownType],
        [{ eventItemTypeId: warmUpType.eventItemTypeId }],
      ).map((typeNode) => typeNode.slug),
    ).toEqual(["exercise", "cool_down"]);
  });

  it("still offers types that allow multiple copies", () => {
    expect(
      filterAddableItemTypes(
        [exerciseType],
        [{ eventItemTypeId: exerciseType.eventItemTypeId }],
      ).map((typeNode) => typeNode.slug),
    ).toEqual(["exercise"]);
  });
});

describe("shouldUseCompactItemMetricFields", () => {
  it("uses a compact row for a few number metrics", () => {
    expect(shouldUseCompactItemMetricFields(setMetrics)).toBe(true);
  });
});

describe("eventItemsToInputs", () => {
  it("converts saved event items into create payloads", () => {
    expect(
      eventItemsToInputs([
        sampleExercise({
          children: [
            {
              id: "set-1",
              eventId: "event-1",
              eventItemTypeId: "set-type-id",
              parentEventItemId: "exercise-1",
              sortOrder: 0,
              label: null,
              startedAt: null,
              endedAt: null,
              durationSeconds: null,
              notes: null,
              structuredData: null,
              createdAt: "2026-08-05T10:00:00.000Z",
              updatedAt: "2026-08-05T10:00:00.000Z",
              eventItemType: {
                id: "set-type-id",
                sportId: null,
                slug: "set",
                name: "Set",
                active: true,
                createdAt: "2026-08-05T10:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
                sport: null,
              },
              metrics: [
                {
                  id: "metric-1",
                  eventItemId: "set-1",
                  metricDefinitionId: "rep-metric-id",
                  numericValue: "10",
                  textValue: null,
                  booleanValue: null,
                  unit: null,
                  createdAt: "2026-08-05T10:00:00.000Z",
                  updatedAt: "2026-08-05T10:00:00.000Z",
                  metricDefinition: setMetrics[0]!.metricDefinition,
                },
              ],
              children: [],
            },
          ],
        }),
      ]),
    ).toEqual([
      {
        eventItemTypeId: "exercise-type-id",
        sortOrder: 0,
        label: "Curls",
        children: [
          {
            eventItemTypeId: "set-type-id",
            sortOrder: 0,
            metrics: [{ metricDefinitionId: "rep-metric-id", numericValue: 10 }],
          },
        ],
      },
    ]);
  });

  it("copies optional item fields when present", () => {
    expect(
      eventItemsToInputs([
        {
          id: "shift-1",
          eventId: "event-1",
          eventItemTypeId: "shift-type-id",
          parentEventItemId: null,
          sortOrder: 1,
          label: "Late third-period shift",
          startedAt: "2026-08-18T18:45:00.000Z",
          endedAt: "2026-08-18T18:46:00.000Z",
          durationSeconds: 42,
          notes: "Strong finish",
          structuredData: { line: "first" },
          createdAt: "2026-08-05T10:00:00.000Z",
          updatedAt: "2026-08-05T10:00:00.000Z",
          eventItemType: {
            id: "shift-type-id",
            sportId: null,
            slug: "shift",
            name: "Shift",
            active: true,
            createdAt: "2026-08-05T10:00:00.000Z",
            updatedAt: "2026-08-05T10:00:00.000Z",
            sport: null,
          },
          metrics: [],
          children: [],
        },
      ]),
    ).toEqual([
      {
        eventItemTypeId: "shift-type-id",
        sortOrder: 1,
        label: "Late third-period shift",
        startedAt: "2026-08-18T18:45:00.000Z",
        endedAt: "2026-08-18T18:46:00.000Z",
        durationSeconds: 42,
        notes: "Strong finish",
        structuredData: { line: "first" },
      },
    ]);
  });
});
