"use client";

import { RpeScaleInfoTooltip } from "@/components/dashboard/rpe-scale-guide";
import { formatMetricUnit, isScale1To10Metric, isSecondsMetric } from "@/lib/event-metric-form";
import { setMetricFieldName, setMetricValueTypeFieldName } from "@/lib/event-item-form";
import type { EventItemTypeMetricDefinition } from "@/lib/types";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type SetMetricFieldsProps = {
  exerciseIndex: number;
  setIndex: number;
  mappings: EventItemTypeMetricDefinition[];
  defaultValues?: Record<string, string>;
};

export function SetMetricFields({
  exerciseIndex,
  setIndex,
  mappings,
  defaultValues = {},
}: SetMetricFieldsProps) {
  if (mappings.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {mappings.map((mapping) => {
        const fieldName = setMetricFieldName(exerciseIndex, setIndex, mapping.metricDefinitionId);
        const valueTypeFieldName = setMetricValueTypeFieldName(
          exerciseIndex,
          setIndex,
          mapping.metricDefinitionId,
        );
        const defaultValue = defaultValues[mapping.metricDefinitionId] ?? "";
        const unit = formatMetricUnit(mapping.metricDefinition.canonicalUnit);
        const label = mapping.required
          ? `${mapping.metricDefinition.name} *`
          : mapping.metricDefinition.name;

        if (mapping.metricDefinition.valueType === "boolean") {
          return (
            <div key={mapping.id}>
              <input
                type="hidden"
                name={valueTypeFieldName}
                value={mapping.metricDefinition.valueType}
              />
              <label className="flex items-start gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  name={fieldName}
                  defaultChecked={defaultValue === "on"}
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
            <p key={mapping.id} className="text-sm text-zinc-500">
              {mapping.metricDefinition.name} uses duration fields that are not supported on sets
              yet.
            </p>
          );
        }

        const isRpeMetric = isScale1To10Metric(mapping.metricDefinition.canonicalUnit);
        const inputId = `set-metric-${exerciseIndex}-${setIndex}-${mapping.metricDefinitionId}`;

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
  );
}
