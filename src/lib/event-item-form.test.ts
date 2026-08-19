import { describe, expect, it } from "vitest";

import {
  exerciseLabelFieldName,
  parseEventItemsFromFormData,
  parseStrengthTrainingItemsFromFormData,
  setMetricFieldName,
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
});
