import type { EventMetricInput } from "@/lib/api";
import type { EventMetric, EventTypeMetricDefinition } from "@/lib/types";

const METRIC_FIELD_PREFIX = "metric.";

export function metricFieldName(metricDefinitionId: string): string {
  return `${METRIC_FIELD_PREFIX}${metricDefinitionId}`;
}

export type MetricFormValues = Record<string, string>;

export function eventMetricsToFormValues(
  mappings: EventTypeMetricDefinition[],
  metrics?: EventMetric[],
): MetricFormValues {
  const values: MetricFormValues = {};
  const metricByDefinitionId = new Map(
    (metrics ?? []).map((metric) => [metric.metricDefinitionId, metric]),
  );

  for (const mapping of mappings) {
    const saved = metricByDefinitionId.get(mapping.metricDefinitionId);
    if (!saved) {
      continue;
    }

    const { valueType } = mapping.metricDefinition;

    if (valueType === "number" && saved.numericValue !== null) {
      values[mapping.metricDefinitionId] = saved.numericValue;
    } else if (valueType === "text" && saved.textValue !== null) {
      values[mapping.metricDefinitionId] = saved.textValue;
    } else if (valueType === "boolean" && saved.booleanValue !== null) {
      values[mapping.metricDefinitionId] = saved.booleanValue ? "on" : "";
    }
  }

  return values;
}

export function parseMetricsFromFormData(
  formData: FormData,
  mappings: EventTypeMetricDefinition[],
): EventMetricInput[] {
  const metrics: EventMetricInput[] = [];

  for (const mapping of mappings) {
    const fieldName = metricFieldName(mapping.metricDefinitionId);
    const raw = formData.get(fieldName);

    if (mapping.metricDefinition.valueType === "boolean") {
      if (raw === "on") {
        metrics.push({
          metricDefinitionId: mapping.metricDefinitionId,
          booleanValue: true,
        });
      }

      continue;
    }

    const value = typeof raw === "string" ? raw.trim() : "";
    if (value === "") {
      continue;
    }

    if (mapping.metricDefinition.valueType === "number") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        metrics.push({
          metricDefinitionId: mapping.metricDefinitionId,
          numericValue: parsed,
        });
      }

      continue;
    }

    metrics.push({
      metricDefinitionId: mapping.metricDefinitionId,
      textValue: value,
    });
  }

  return metrics;
}

export function validateMetricForm(
  formData: FormData,
  mappings: EventTypeMetricDefinition[],
): string | null {
  for (const mapping of mappings) {
    if (!mapping.required) {
      continue;
    }

    const fieldName = metricFieldName(mapping.metricDefinitionId);
    const raw = formData.get(fieldName);

    if (mapping.metricDefinition.valueType === "boolean") {
      if (raw !== "on") {
        return `${mapping.metricDefinition.name} is required`;
      }

      continue;
    }

    const value = typeof raw === "string" ? raw.trim() : "";
    if (value === "") {
      return `${mapping.metricDefinition.name} is required`;
    }

    if (mapping.metricDefinition.valueType === "number" && Number.isNaN(Number(value))) {
      return `${mapping.metricDefinition.name} must be a number`;
    }
  }

  return null;
}

export function formatMetricUnit(canonicalUnit: string | null): string | null {
  if (!canonicalUnit) {
    return null;
  }

  return canonicalUnit.replace(/_/g, " ");
}
