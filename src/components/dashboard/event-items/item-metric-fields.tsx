"use client";

import { RpeScaleInfoTooltip } from "@/components/dashboard/rpe-scale-guide";
import { DurationPartsFields } from "@/components/form/duration-parts-fields";
import { FormSectionDetails } from "@/components/form/form-section-details";
import {
  itemMetricFieldName,
  itemMetricValueTypeFieldName,
  shouldUseCompactItemMetricFields,
  type EventItemFormPath,
} from "@/lib/event-item-form";
import {
  BOOLEAN_METRIC_CHECKED_VALUE,
  BOOLEAN_METRIC_SAVED_VALUE,
  booleanMetricSavedFieldName,
  formatMetricUnit,
  isSavedBooleanMetricFormValue,
  isScale1To10Metric,
  isSecondsMetric,
} from "@/lib/event-metric-form";
import type { EventItemTypeMetricDefinition } from "@/lib/types";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type ItemMetricFieldsProps = {
  path: EventItemFormPath;
  mappings: EventItemTypeMetricDefinition[];
  defaultValues?: Record<string, string>;
};

export function ItemMetricFields({ path, mappings, defaultValues = {} }: ItemMetricFieldsProps) {
  if (mappings.length === 0) {
    return null;
  }

  const compact = shouldUseCompactItemMetricFields(mappings);

  return (
    <FormSectionDetails title="Metrics">
      <div className={compact ? "grid gap-3 sm:grid-cols-3" : "space-y-4"}>
        {mappings.map((mapping) => {
          const fieldName = itemMetricFieldName(path, mapping.metricDefinitionId);
          const valueTypeFieldName = itemMetricValueTypeFieldName(path, mapping.metricDefinitionId);
          const defaultValue = defaultValues[mapping.metricDefinitionId] ?? "";
          const unit = formatMetricUnit(mapping.metricDefinition.canonicalUnit);
          const label = mapping.required
            ? `${mapping.metricDefinition.name} *`
            : mapping.metricDefinition.name;
          const inputId = `item-metric-${path.join("-")}-${mapping.metricDefinitionId}`;

          if (mapping.metricDefinition.valueType === "boolean") {
            return (
              <div key={mapping.id}>
                <input
                  type="hidden"
                  name={valueTypeFieldName}
                  value={mapping.metricDefinition.valueType}
                />
                {isSavedBooleanMetricFormValue(defaultValue) ? (
                  <input
                    type="hidden"
                    name={booleanMetricSavedFieldName(fieldName)}
                    value={BOOLEAN_METRIC_SAVED_VALUE}
                  />
                ) : null}
                <label className="flex items-start gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name={fieldName}
                    defaultChecked={defaultValue === BOOLEAN_METRIC_CHECKED_VALUE}
                    className="mt-1 rounded border-white/20 bg-[#1c222c]"
                  />
                  <span className="font-medium text-zinc-300">{label}</span>
                </label>
              </div>
            );
          }

          if (
            mapping.metricDefinition.valueType === "number" &&
            isSecondsMetric(mapping.metricDefinition.canonicalUnit)
          ) {
            return (
              <div key={mapping.id}>
                <input
                  type="hidden"
                  name={valueTypeFieldName}
                  value={mapping.metricDefinition.valueType}
                />
                <DurationPartsFields
                  hoursName={`${fieldName}.hours`}
                  minutesName={`${fieldName}.minutes`}
                  secondsName={`${fieldName}.seconds`}
                  defaultHours={defaultValues[`${mapping.metricDefinitionId}.hours`] ?? ""}
                  defaultMinutes={defaultValues[`${mapping.metricDefinitionId}.minutes`] ?? ""}
                  defaultSeconds={defaultValues[`${mapping.metricDefinitionId}.seconds`] ?? ""}
                  label={label}
                  description={mapping.metricDefinition.description}
                  inputClassName={inputClassName}
                />
              </div>
            );
          }

          const isRpeMetric = isScale1To10Metric(mapping.metricDefinition.canonicalUnit);

          return (
            <label key={mapping.id} className="flex flex-col gap-1 text-sm">
              <input
                type="hidden"
                name={valueTypeFieldName}
                value={mapping.metricDefinition.valueType}
              />
              <span className="flex items-center gap-2 font-medium text-zinc-300">
                {label}
                {isRpeMetric ? <RpeScaleInfoTooltip /> : null}
              </span>
              <input
                id={inputId}
                name={fieldName}
                type={mapping.metricDefinition.valueType === "number" ? "number" : "text"}
                defaultValue={defaultValue}
                className={inputClassName}
                {...(isRpeMetric ? { min: 1, max: 10, step: 1 } : {})}
              />
              {unit ? <span className="text-xs text-zinc-500">Unit: {unit}</span> : null}
            </label>
          );
        })}
      </div>
    </FormSectionDetails>
  );
}
