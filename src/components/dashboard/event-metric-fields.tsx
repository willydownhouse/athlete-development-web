"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { fetchEventTypeMetricDefinitions } from "@/lib/api";
import {
  eventMetricsToFormValues,
  formatMetricUnit,
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
  const t = useTranslations("events.metrics");
  const tCommon = useTranslations("common");

  if (loading) {
    return <p className="text-sm text-zinc-500">{t("loading")}</p>;
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
        <h3 className="text-sm font-medium text-white">{tCommon("metrics")}</h3>
        <p className="mt-1 text-xs text-zinc-500">{t("optionalHint")}</p>
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
              <div key={mapping.id} className="space-y-2 text-sm">
                <span className="font-medium text-zinc-300">{label}</span>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">{t("hours")}</span>
                    <input
                      name={metricDurationFieldName(mapping.metricDefinitionId, "hours")}
                      type="number"
                      min={0}
                      defaultValue={hours}
                      placeholder={t("zeroPlaceholder")}
                      className={inputClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">{t("minutes")}</span>
                    <input
                      name={metricDurationFieldName(mapping.metricDefinitionId, "minutes")}
                      type="number"
                      min={0}
                      max={59}
                      defaultValue={minutes}
                      placeholder={t("zeroPlaceholder")}
                      className={inputClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">{t("seconds")}</span>
                    <input
                      name={metricDurationFieldName(mapping.metricDefinitionId, "seconds")}
                      type="number"
                      min={0}
                      max={59}
                      defaultValue={seconds}
                      placeholder={t("zeroPlaceholder")}
                      className={inputClassName}
                    />
                  </label>
                </div>
                {mapping.metricDefinition.description ? (
                  <span className="text-xs text-zinc-500">
                    {mapping.metricDefinition.description}
                  </span>
                ) : null}
              </div>
            );
          }

          return (
            <label key={mapping.id} className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-300">{label}</span>
              <input
                name={fieldName}
                type={mapping.metricDefinition.valueType === "number" ? "number" : "text"}
                defaultValue={defaultValue}
                className={inputClassName}
              />
              {mapping.metricDefinition.description || unit ? (
                <span className="text-xs text-zinc-500">
                  {[
                    mapping.metricDefinition.description,
                    unit ? tCommon("unitLabel", { unit }) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              ) : null}
            </label>
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
};

export function EventTypeMetricsSection({
  eventTypeId,
  savedMetrics,
  fieldsResetKey,
  onMappingsChange,
}: EventTypeMetricsSectionProps) {
  const tLoadErrors = useTranslations("dashboard.loadErrors");
  const [mappings, setMappings] = useState<EventTypeMetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchEventTypeMetricDefinitions(eventTypeId)
      .then((items) => {
        if (cancelled) {
          return;
        }

        setMappings(items);
        onMappingsChange(items);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setMappings([]);
        onMappingsChange([]);
        setLoadError(error instanceof Error ? error.message : tLoadErrors("metrics"));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventTypeId, onMappingsChange, tLoadErrors]);

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
