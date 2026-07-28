"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  createEventTypeMetricAction,
  deleteEventTypeMetricAction,
  updateEventTypeMetricAction,
  type ActionState,
} from "@/app/admin/actions";
import type { EventTypeMetricDefinition, MetricDefinition } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

type AddEventTypeMetricFormProps = {
  eventTypeId: string;
  availableMetrics: MetricDefinition[];
};

function AddEventTypeMetricForm({ eventTypeId, availableMetrics }: AddEventTypeMetricFormProps) {
  const [state, formAction] = useActionState(createEventTypeMetricAction, initialState);

  if (availableMetrics.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        All compatible metrics are already allowed for this event type.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventTypeId" value={eventTypeId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">Metric</span>
          <select name="metricDefinitionId" required className={inputClassName}>
            <option value="">Select a metric</option>
            {availableMetrics.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.name} ({metric.key})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClassName} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="required" type="checkbox" className="rounded border-slate-300" />
        Required metric
      </label>

      <SubmitButton>Allow metric</SubmitButton>
    </form>
  );
}

type EventTypeMetricRowProps = {
  eventTypeId: string;
  mapping: EventTypeMetricDefinition;
};

function EventTypeMetricRow({ eventTypeId, mapping }: EventTypeMetricRowProps) {
  const [state, formAction] = useActionState(updateEventTypeMetricAction, initialState);

  return (
    <li className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{mapping.metricDefinition.name}</p>
          <p className="font-mono text-sm text-slate-500">{mapping.metricDefinition.key}</p>
          <p className="mt-1 text-sm text-slate-600">
            {mapping.metricDefinition.valueType}
            {mapping.metricDefinition.canonicalUnit
              ? ` · ${mapping.metricDefinition.canonicalUnit}`
              : ""}
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="eventTypeId" value={eventTypeId} />
        <input type="hidden" name="eventTypeMetricDefinitionId" value={mapping.id} />
        <FormMessage error={state.error} success={state.success} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Sort order</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={mapping.sortOrder}
              className={`${inputClassName} w-28`}
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
            <input
              name="required"
              type="checkbox"
              defaultChecked={mapping.required}
              className="rounded border-slate-300"
            />
            Required
          </label>
          <SubmitButton variant="secondary">Update</SubmitButton>
        </div>
      </form>

      <form action={deleteEventTypeMetricAction} className="mt-3">
        <input type="hidden" name="eventTypeId" value={eventTypeId} />
        <input type="hidden" name="eventTypeMetricDefinitionId" value={mapping.id} />
        <SubmitButton variant="danger">Remove</SubmitButton>
      </form>
    </li>
  );
}

type EventTypeMetricsSectionProps = {
  eventTypeId: string;
  mappings: EventTypeMetricDefinition[];
  availableMetrics: MetricDefinition[];
};

export function EventTypeMetricsSection({
  eventTypeId,
  mappings,
  availableMetrics,
}: EventTypeMetricsSectionProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium text-slate-900">Allow metric</h2>
        <div className="mt-4">
          <AddEventTypeMetricForm eventTypeId={eventTypeId} availableMetrics={availableMetrics} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium text-slate-900">Allowed metrics ({mappings.length})</h2>

        {mappings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No metrics allowed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {mappings.map((mapping) => (
              <EventTypeMetricRow key={mapping.id} eventTypeId={eventTypeId} mapping={mapping} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
