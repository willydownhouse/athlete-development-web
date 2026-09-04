import { describe, expect, it } from "vitest";

import {
  eventItemsToInputs,
  eventItemsToStrengthFormValues,
  exerciseItemIdFieldName,
  exerciseLabelFieldName,
  parseEventItemsFromFormData,
  parseStrengthTrainingItemsFromFormData,
  setItemIdFieldName,
  setMetricFieldName,
  setMetricValueTypeFieldName,
  type StrengthTrainingItemFormConfig,
} from "./event-item-form";

const config: StrengthTrainingItemFormConfig = {
  exerciseItemTypeId: "exercise-type-id",
  setItemTypeId: "set-type-id",
  setMetricMappings: [
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
  ],
};

describe("parseStrengthTrainingItemsFromFormData", () => {
  it("builds exercise and set items from form fields", () => {
    const formData = new FormData();
    formData.set("items[0].eventItemTypeId", config.exerciseItemTypeId);
    formData.set(exerciseLabelFieldName(0), "Curls");
    formData.set("items[0].children[0].eventItemTypeId", config.setItemTypeId);
    formData.set(setMetricFieldName(0, 0, "rep-metric-id"), "10");
    formData.set(setMetricFieldName(0, 0, "load-metric-id"), "20");
    formData.set("items[0].children[1].eventItemTypeId", config.setItemTypeId);
    formData.set(setMetricFieldName(0, 1, "rep-metric-id"), "8");

    expect(parseStrengthTrainingItemsFromFormData(formData, config)).toEqual([
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

  it("skips empty exercises", () => {
    const formData = new FormData();
    formData.set("items[0].eventItemTypeId", config.exerciseItemTypeId);
    formData.set(exerciseLabelFieldName(0), "  ");

    expect(parseStrengthTrainingItemsFromFormData(formData, config)).toEqual([]);
  });

  it("includes existing item ids when present", () => {
    const formData = new FormData();
    formData.set(exerciseItemIdFieldName(0), "exercise-1");
    formData.set("items[0].eventItemTypeId", config.exerciseItemTypeId);
    formData.set(exerciseLabelFieldName(0), "Curls");
    formData.set(setItemIdFieldName(0, 0), "set-1");
    formData.set("items[0].children[0].eventItemTypeId", config.setItemTypeId);
    formData.set(setMetricFieldName(0, 0, "rep-metric-id"), "10");
    formData.set("items[0].children[1].eventItemTypeId", config.setItemTypeId);
    formData.set(setMetricFieldName(0, 1, "rep-metric-id"), "8");

    expect(parseStrengthTrainingItemsFromFormData(formData, config)).toEqual([
      {
        id: "exercise-1",
        eventItemTypeId: "exercise-type-id",
        label: "Curls",
        children: [
          {
            id: "set-1",
            eventItemTypeId: "set-type-id",
            metrics: [{ metricDefinitionId: "rep-metric-id", numericValue: 10 }],
          },
          {
            eventItemTypeId: "set-type-id",
            metrics: [{ metricDefinitionId: "rep-metric-id", numericValue: 8 }],
          },
        ],
      },
    ]);
  });
});

describe("parseEventItemsFromFormData", () => {
  it("builds exercise and set items without a catalog", () => {
    const formData = new FormData();
    formData.set("items[0].eventItemTypeId", "exercise-type-id");
    formData.set(exerciseLabelFieldName(0), "Curls");
    formData.set("items[0].children[0].eventItemTypeId", "set-type-id");
    formData.set(setMetricFieldName(0, 0, "rep-metric-id"), "10");
    formData.set(setMetricFieldName(0, 0, "load-metric-id"), "20");

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
        ],
      },
    ]);
  });

  it("includes existing item ids when present", () => {
    const formData = new FormData();
    formData.set(exerciseItemIdFieldName(0), "exercise-1");
    formData.set("items[0].eventItemTypeId", "exercise-type-id");
    formData.set(exerciseLabelFieldName(0), "Curls");
    formData.set(setItemIdFieldName(0, 0), "set-1");
    formData.set("items[0].children[0].eventItemTypeId", "set-type-id");
    formData.set(setMetricFieldName(0, 0, "rep-metric-id"), "10");

    expect(parseEventItemsFromFormData(formData)).toEqual([
      {
        id: "exercise-1",
        eventItemTypeId: "exercise-type-id",
        label: "Curls",
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

  it("uses submitted value type metadata for set text metrics", () => {
    const formData = new FormData();
    formData.set("items[0].eventItemTypeId", "exercise-type-id");
    formData.set(exerciseLabelFieldName(0), "Curls");
    formData.set("items[0].children[0].eventItemTypeId", "set-type-id");
    formData.set(setMetricValueTypeFieldName(0, 0, "note-metric-id"), "text");
    formData.set(setMetricFieldName(0, 0, "note-metric-id"), "123");

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

describe("eventItemsToStrengthFormValues", () => {
  it("keeps saved exercise and set ids", () => {
    expect(
      eventItemsToStrengthFormValues(
        [
          {
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
                    metricDefinition: config.setMetricMappings[0]!.metricDefinition,
                  },
                ],
                children: [],
              },
            ],
          },
        ],
        "exercise-type-id",
        "set-type-id",
        config.setMetricMappings,
      ),
    ).toEqual([
      {
        id: "exercise-1",
        label: "Curls",
        sets: [{ id: "set-1", values: { "rep-metric-id": "10" } }],
      },
    ]);
  });
});

describe("eventItemsToInputs", () => {
  it("converts saved event items into create payloads", () => {
    expect(
      eventItemsToInputs([
        {
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
                  metricDefinition: config.setMetricMappings[0]!.metricDefinition,
                },
              ],
              children: [],
            },
          ],
        },
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
