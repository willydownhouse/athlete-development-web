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

export function isScale1To10Metric(canonicalUnit: string | null): boolean {
  return canonicalUnit === "scale_1_10";
}

export const EVENT_DURATION_FIELDS = {
  hours: "durationHours",
  minutes: "durationMinutes",
  seconds: "durationSeconds",
} as const;

export type DurationFieldNames = {
  hours: string;
  minutes: string;
  seconds: string;
};

export function secondsToDurationParts(totalSeconds: number): {
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

export function readDurationPartsSecondsFromFormData(
  formData: FormData,
  fieldNames: DurationFieldNames,
): number {
  const hours = readOptionalInt(formData, fieldNames.hours) ?? 0;
  const minutes = readOptionalInt(formData, fieldNames.minutes) ?? 0;
  const seconds = readOptionalInt(formData, fieldNames.seconds) ?? 0;

  return durationPartsToSeconds(hours, minutes, seconds);
}

function hasDurationPartsInput(formData: FormData, fieldNames: DurationFieldNames): boolean {
  return (["hours", "minutes", "seconds"] as const).some((part) => {
    const value = formData.get(fieldNames[part]);
    return typeof value === "string" && value.trim() !== "";
  });
}

function readDurationSecondsFromFormData(formData: FormData, metricDefinitionId: string): number {
  return readDurationPartsSecondsFromFormData(formData, {
    hours: metricDurationFieldName(metricDefinitionId, "hours"),
    minutes: metricDurationFieldName(metricDefinitionId, "minutes"),
    seconds: metricDurationFieldName(metricDefinitionId, "seconds"),
  });
}

function hasDurationInput(formData: FormData, metricDefinitionId: string): boolean {
  return hasDurationPartsInput(formData, {
    hours: metricDurationFieldName(metricDefinitionId, "hours"),
    minutes: metricDurationFieldName(metricDefinitionId, "minutes"),
    seconds: metricDurationFieldName(metricDefinitionId, "seconds"),
  });
}

export type MetricFormValues = Record<string, string>;

export function eventMetricsToFormValues(
  mappings: EventTypeMetricDefinition[],
  metrics?: Pick<
    EventMetric,
    "metricDefinitionId" | "numericValue" | "textValue" | "booleanValue" | "metricDefinition"
  >[],
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

export function eventMetricsToInputs(metrics: EventMetric[]): EventMetricInput[] {
  const inputs: EventMetricInput[] = [];

  for (const metric of metrics) {
    const { valueType } = metric.metricDefinition;

    if (valueType === "boolean" && metric.booleanValue !== null) {
      inputs.push({
        metricDefinitionId: metric.metricDefinitionId,
        booleanValue: metric.booleanValue,
      });
      continue;
    }

    if (valueType === "number" && metric.numericValue !== null) {
      inputs.push({
        metricDefinitionId: metric.metricDefinitionId,
        numericValue: Number(metric.numericValue),
        unit: metric.unit ?? undefined,
      });
      continue;
    }

    if (valueType === "text" && metric.textValue) {
      inputs.push({
        metricDefinitionId: metric.metricDefinitionId,
        textValue: metric.textValue,
        unit: metric.unit ?? undefined,
      });
    }
  }

  return inputs;
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

function readDurationSecondsWithPrefix(
  formData: FormData,
  prefix: string,
  metricDefinitionId: string,
): number {
  return readDurationPartsSecondsFromFormData(formData, {
    hours: `${prefix}${metricDefinitionId}.hours`,
    minutes: `${prefix}${metricDefinitionId}.minutes`,
    seconds: `${prefix}${metricDefinitionId}.seconds`,
  });
}

function hasDurationInputWithPrefix(
  formData: FormData,
  prefix: string,
  metricDefinitionId: string,
): boolean {
  return hasDurationPartsInput(formData, {
    hours: `${prefix}${metricDefinitionId}.hours`,
    minutes: `${prefix}${metricDefinitionId}.minutes`,
    seconds: `${prefix}${metricDefinitionId}.seconds`,
  });
}

/** Parse metric inputs from form field names without a catalog fetch (API validates values). */
export function parseMetricInputsWithPrefix(
  formData: FormData,
  prefix: string,
): EventMetricInput[] {
  const metrics: EventMetricInput[] = [];
  const durationMetricIds = new Set<string>();

  for (const key of formData.keys()) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const rest = key.slice(prefix.length);
    const durationMatch = /^(.+)\.(hours|minutes|seconds)$/.exec(rest);
    if (durationMatch?.[1]) {
      durationMetricIds.add(durationMatch[1]);
    }
  }

  for (const metricDefinitionId of durationMetricIds) {
    if (!hasDurationInputWithPrefix(formData, prefix, metricDefinitionId)) {
      continue;
    }

    metrics.push({
      metricDefinitionId,
      numericValue: readDurationSecondsWithPrefix(formData, prefix, metricDefinitionId),
    });
  }

  for (const key of formData.keys()) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const metricDefinitionId = key.slice(prefix.length);
    if (metricDefinitionId.includes(".")) {
      continue;
    }

    if (durationMetricIds.has(metricDefinitionId)) {
      continue;
    }

    const raw = formData.get(key);

    if (raw === "on") {
      metrics.push({
        metricDefinitionId,
        booleanValue: true,
      });
      continue;
    }

    const value = typeof raw === "string" ? raw.trim() : "";
    if (value === "") {
      continue;
    }

    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      metrics.push({
        metricDefinitionId,
        numericValue: parsed,
      });
      continue;
    }

    metrics.push({
      metricDefinitionId,
      textValue: value,
    });
  }

  return metrics;
}

export function parseEventMetricsFromFormData(formData: FormData): EventMetricInput[] {
  return parseMetricInputsWithPrefix(formData, METRIC_FIELD_PREFIX);
}

export function validateDurationPartsForm(
  formData: FormData,
  fieldNames: DurationFieldNames,
  label: string,
): string | null {
  for (const part of ["hours", "minutes", "seconds"] as const) {
    const raw = formData.get(fieldNames[part]);
    if (typeof raw === "string" && raw.trim() !== "" && Number.isNaN(Number(raw))) {
      return `${label} must use whole numbers`;
    }
  }

  return null;
}

function validateNumericMetricValue(
  mapping: EventTypeMetricDefinition,
  value: string,
): string | null {
  const { name, canonicalUnit } = mapping.metricDefinition;

  if (Number.isNaN(Number(value))) {
    return `${name} must be a number`;
  }

  if (isScale1To10Metric(canonicalUnit)) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
      return `${name} must be between 1 and 10`;
    }
  }

  return null;
}

function readMetricFieldValue(formData: FormData, mapping: EventTypeMetricDefinition): string {
  const raw = formData.get(metricFieldName(mapping.metricDefinitionId));
  return typeof raw === "string" ? raw.trim() : "";
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

      const durationError = validateDurationPartsForm(
        formData,
        {
          hours: metricDurationFieldName(mapping.metricDefinitionId, "hours"),
          minutes: metricDurationFieldName(mapping.metricDefinitionId, "minutes"),
          seconds: metricDurationFieldName(mapping.metricDefinitionId, "seconds"),
        },
        mapping.metricDefinition.name,
      );
      if (durationError) {
        return durationError;
      }

      continue;
    }

    const raw = formData.get(fieldName);
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value === "") {
      return `${mapping.metricDefinition.name} is required`;
    }

    if (mapping.metricDefinition.valueType === "number") {
      const numericError = validateNumericMetricValue(mapping, value);
      if (numericError) {
        return numericError;
      }
    }

    continue;
  }

  for (const mapping of mappings) {
    if (mapping.metricDefinition.valueType !== "number") {
      continue;
    }

    if (isSecondsMetric(mapping.metricDefinition.canonicalUnit)) {
      continue;
    }

    const value = readMetricFieldValue(formData, mapping);
    if (value === "") {
      continue;
    }

    const numericError = validateNumericMetricValue(mapping, value);
    if (numericError) {
      return numericError;
    }
  }

  return null;
}

function metricsPayloadEqual(
  left: EventMetricInput | undefined,
  right: EventMetricInput | undefined,
): boolean {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

/** Catch catalog-free parse mismatches before submit (e.g. numeric strings in text metrics). */
export function validateEventMetricPayloadForm(
  formData: FormData,
  mappings: EventTypeMetricDefinition[],
): string | null {
  if (mappings.length === 0) {
    return null;
  }

  const expectedMetrics = parseMetricsFromFormData(formData, mappings);
  const payloadMetrics = parseEventMetricsFromFormData(formData);
  const expectedById = new Map(
    expectedMetrics.map((metric) => [metric.metricDefinitionId, metric]),
  );
  const payloadById = new Map(payloadMetrics.map((metric) => [metric.metricDefinitionId, metric]));
  const mappingById = new Map(mappings.map((mapping) => [mapping.metricDefinitionId, mapping]));

  for (const [metricDefinitionId, expectedMetric] of expectedById) {
    if (metricsPayloadEqual(payloadById.get(metricDefinitionId), expectedMetric)) {
      continue;
    }

    const mapping = mappingById.get(metricDefinitionId);
    if (!mapping) {
      continue;
    }

    const { name, valueType } = mapping.metricDefinition;

    if (valueType === "text") {
      return `${name} must be text`;
    }

    if (valueType === "number") {
      return `${name} must be a number`;
    }

    return `${name} is required`;
  }

  return null;
}

export function formatMetricUnit(canonicalUnit: string | null): string | null {
  if (!canonicalUnit || isScale1To10Metric(canonicalUnit)) {
    return null;
  }

  return canonicalUnit.replace(/_/g, " ");
}
