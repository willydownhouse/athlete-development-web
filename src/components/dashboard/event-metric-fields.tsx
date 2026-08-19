"use client";

import { useEffect, useState } from "react";

import { RpeScaleInfoTooltip } from "@/components/dashboard/rpe-scale-guide";
import { DurationPartsFields } from "@/components/form/duration-parts-fields";
import { fetchEventTypeMetricDefinitions } from "@/lib/api";
import {
  eventMetricsToFormValues,
  formatMetricUnit,
  isScale1To10Metric,
  isSecondsMetric,
  metricDurationFieldName,
  metricFieldName,
} from "@/lib/event-metric-form";
import type { EventMetric, EventTypeMetricDefinition } from "@/lib/types";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type EventMetricFieldsProps = {
  mappings: EventTypeMetricDefinition[];
  savedMetrics?: EventMetric[];
  loading?: boolean;
  loadError?: string | null;
  resetKey?: string;
};

function EventMetricFields({
  mappings,
  savedMetrics,
  loading = false,
  loadError,
  resetKey,
}: EventMetricFieldsProps) {
  if (loading) {
    return <p className="text-sm text-zinc-500">Loading metric fields…</p>;
  }

  if (loadError) {
    return <p className="text-sm text-red-300">{loadError}</p>;
  }

  if (mappings.length === 0) {
    return null;
  }

  const values = eventMetricsToFormValues(mappings, savedMetrics);

  return (
    <div key={resetKey} className="space-y-4 rounded-xl border border-white/10 bg-[#171b22] p-4">
      <div>
        <h3 className="text-sm font-medium text-white">Metrics</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Optional details configured for this event type.
        </p>
      </div>

      <div className="space-y-4">
        {mappings.map((mapping) => {
          const fieldName = metricFieldName(mapping.metricDefinitionId);
          const defaultValue = values[mapping.metricDefinitionId] ?? "";
          const unit = formatMetricUnit(mapping.metricDefinition.canonicalUnit);
          const label = mapping.required
            ? `${mapping.metricDefinition.name} *`
            : mapping.metricDefinition.name;

          if (mapping.metricDefinition.valueType === "boolean") {
            return (
              <label key={mapping.id} className="flex items-start gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  name={fieldName}
                  defaultChecked={defaultValue === "on"}
                  className="mt-1 rounded border-white/20 bg-[#1c222c]"
                />
                <span>
                  <span className="font-medium text-zinc-300">{label}</span>
                  {mapping.metricDefinition.description ? (
                    <span className="mt-1 block text-xs text-zinc-500">
                      {mapping.metricDefinition.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          }

          if (
            mapping.metricDefinition.valueType === "number" &&
            isSecondsMetric(mapping.metricDefinition.canonicalUnit)
          ) {
            const hours =
              values[metricDurationFieldName(mapping.metricDefinitionId, "hours")] ?? "";
            const minutes =
              values[metricDurationFieldName(mapping.metricDefinitionId, "minutes")] ?? "";
            const seconds =
              values[metricDurationFieldName(mapping.metricDefinitionId, "seconds")] ?? "";

            return (
              <DurationPartsFields
                key={mapping.id}
                hoursName={metricDurationFieldName(mapping.metricDefinitionId, "hours")}
                minutesName={metricDurationFieldName(mapping.metricDefinitionId, "minutes")}
                secondsName={metricDurationFieldName(mapping.metricDefinitionId, "seconds")}
                defaultHours={hours}
                defaultMinutes={minutes}
                defaultSeconds={seconds}
                label={label}
                description={mapping.metricDefinition.description}
                inputClassName={inputClassName}
              />
            );
          }

          const isRpeMetric = isScale1To10Metric(mapping.metricDefinition.canonicalUnit);
          const inputId = `metric-input-${mapping.metricDefinitionId}`;

          return (
            <div key={mapping.id} className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <label htmlFor={inputId} className="font-medium text-zinc-300">
                  {label}
                </label>
                {isRpeMetric ? <RpeScaleInfoTooltip /> : null}
              </div>
              <input
                id={inputId}
                name={fieldName}
                type={mapping.metricDefinition.valueType === "number" ? "number" : "text"}
                defaultValue={defaultValue}
                className={inputClassName}
                {...(isRpeMetric ? { min: 1, max: 10, step: 1 } : {})}
              />
              {mapping.metricDefinition.description || unit || isRpeMetric ? (
                <span className="text-xs text-zinc-500">
                  {[
                    mapping.metricDefinition.description,
                    isRpeMetric
                      ? "Enter a whole number from 1 to 10"
                      : unit
                        ? `Unit: ${unit}`
                        : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type EventTypeMetricsSectionProps = {
  eventTypeId: string;
  savedMetrics?: EventMetric[];
  fieldsResetKey: string;
  onMappingsChange: (mappings: EventTypeMetricDefinition[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  onLoadErrorChange?: (error: string | null) => void;
};

export function EventTypeMetricsSection({
  eventTypeId,
  savedMetrics,
  fieldsResetKey,
  onMappingsChange,
  onLoadingChange,
  onLoadErrorChange,
}: EventTypeMetricsSectionProps) {
  const [mappings, setMappings] = useState<EventTypeMetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    onLoadingChange?.(true);
    onLoadErrorChange?.(null);

    void fetchEventTypeMetricDefinitions(eventTypeId)
      .then((items) => {
        if (cancelled) {
          return;
        }

        setMappings(items);
        onMappingsChange(items);
        setLoadError(null);
        onLoadErrorChange?.(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load metrics";
        setMappings([]);
        onMappingsChange([]);
        setLoadError(message);
        onLoadErrorChange?.(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      });

    return () => {
      cancelled = true;
      onLoadingChange?.(false);
    };
  }, [eventTypeId, onLoadErrorChange, onLoadingChange, onMappingsChange]);

  return (
    <EventMetricFields
      mappings={mappings}
      savedMetrics={savedMetrics}
      loading={loading}
      loadError={loadError}
      resetKey={fieldsResetKey}
    />
  );
}
