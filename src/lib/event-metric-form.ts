import type { EventMetricInput } from "@/lib/api";
import type { EventMetric, EventTypeMetricDefinition } from "@/lib/types";

const METRIC_FIELD_PREFIX = "metric.";

export function metricFieldName(metricDefinitionId: string): string {
  return `${METRIC_FIELD_PREFIX}${metricDefinitionId}`;
}

export function metricDurationFieldName(
  metricDefinitionId: string,
  part: "hours" | "minutes" | "seconds",
): string {
  return `${metricFieldName(metricDefinitionId)}.${part}`;
}

export function isSecondsMetric(canonicalUnit: string | null): boolean {
  return canonicalUnit === "s";
}

function secondsToDurationParts(totalSeconds: number): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  const normalized = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const seconds = normalized % 60;

  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: minutes > 0 ? String(minutes) : "",
    seconds: seconds > 0 ? String(seconds) : "",
  };
}

export function durationPartsToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

function readOptionalInt(formData: FormData, key: string): number | undefined {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function readDurationSecondsFromFormData(formData: FormData, metricDefinitionId: string): number {
  const hours =
    readOptionalInt(formData, metricDurationFieldName(metricDefinitionId, "hours")) ?? 0;
  const minutes =
    readOptionalInt(formData, metricDurationFieldName(metricDefinitionId, "minutes")) ?? 0;
  const seconds =
    readOptionalInt(formData, metricDurationFieldName(metricDefinitionId, "seconds")) ?? 0;

  return durationPartsToSeconds(hours, minutes, seconds);
}

function hasDurationInput(formData: FormData, metricDefinitionId: string): boolean {
  return (["hours", "minutes", "seconds"] as const).some((part) => {
    const value = formData.get(metricDurationFieldName(metricDefinitionId, part));
    return typeof value === "string" && value.trim() !== "";
  });
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
      if (isSecondsMetric(mapping.metricDefinition.canonicalUnit)) {
        const parts = secondsToDurationParts(Number(saved.numericValue));
        values[metricDurationFieldName(mapping.metricDefinitionId, "hours")] = parts.hours;
        values[metricDurationFieldName(mapping.metricDefinitionId, "minutes")] = parts.minutes;
        values[metricDurationFieldName(mapping.metricDefinitionId, "seconds")] = parts.seconds;
      } else {
        values[mapping.metricDefinitionId] = saved.numericValue;
      }
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

    if (mapping.metricDefinition.valueType === "boolean") {
      const raw = formData.get(fieldName);
      if (raw === "on") {
        metrics.push({
          metricDefinitionId: mapping.metricDefinitionId,
          booleanValue: true,
        });
      }

      continue;
    }

    if (
      mapping.metricDefinition.valueType === "number" &&
      isSecondsMetric(mapping.metricDefinition.canonicalUnit)
    ) {
      if (!hasDurationInput(formData, mapping.metricDefinitionId)) {
        continue;
      }

      const totalSeconds = readDurationSecondsFromFormData(formData, mapping.metricDefinitionId);
      metrics.push({
        metricDefinitionId: mapping.metricDefinitionId,
        numericValue: totalSeconds,
      });

      continue;
    }

    const raw = formData.get(fieldName);
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

    if (mapping.metricDefinition.valueType === "boolean") {
      const raw = formData.get(fieldName);
      if (raw !== "on") {
        return `${mapping.metricDefinition.name} is required`;
      }

      continue;
    }

    if (
      mapping.metricDefinition.valueType === "number" &&
      isSecondsMetric(mapping.metricDefinition.canonicalUnit)
    ) {
      if (!hasDurationInput(formData, mapping.metricDefinitionId)) {
        return `${mapping.metricDefinition.name} is required`;
      }

      for (const part of ["hours", "minutes", "seconds"] as const) {
        const raw = formData.get(metricDurationFieldName(mapping.metricDefinitionId, part));
        if (typeof raw === "string" && raw.trim() !== "" && Number.isNaN(Number(raw))) {
          return `${mapping.metricDefinition.name} must use whole numbers`;
        }
      }

      continue;
    }

    const raw = formData.get(fieldName);
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
