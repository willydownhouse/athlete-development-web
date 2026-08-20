"use client";

import { useActionState, useEffect } from "react";

import { AdminCreateModal, useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { AdminFormSelect } from "@/components/admin/admin-form-select";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  createEventItemTypeMetricAction,
  deleteEventItemTypeMetricAction,
  updateEventItemTypeMetricAction,
  type ActionState,
} from "@/app/admin/actions";
import type { EventItemTypeMetricDefinition, MetricDefinition } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type AddEventItemTypeMetricFormProps = {
  eventItemTypeId: string;
  availableMetrics: MetricDefinition[];
};

function AddEventItemTypeMetricForm({
  eventItemTypeId,
  availableMetrics,
}: AddEventItemTypeMetricFormProps) {
  const [state, formAction] = useActionState(createEventItemTypeMetricAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventItemTypeId" value={eventItemTypeId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-300">Metric</span>
          <AdminFormSelect
            name="metricDefinitionId"
            required
            placeholder="Select a metric"
            options={availableMetrics.map((metric) => ({
              value: metric.id,
              label: `${metric.name} (${metric.key})`,
            }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClassName} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input name="required" type="checkbox" className="rounded border-white/20 bg-[#1c222c]" />
        Required metric
      </label>

      <SubmitButton>Allow metric</SubmitButton>
    </form>
  );
}

type EventItemTypeMetricRowProps = {
  eventItemTypeId: string;
  mapping: EventItemTypeMetricDefinition;
};

function EventItemTypeMetricRow({ eventItemTypeId, mapping }: EventItemTypeMetricRowProps) {
  const [state, formAction] = useActionState(updateEventItemTypeMetricAction, initialState);

  return (
    <li className="rounded-xl border border-white/10 bg-[#1c222c] p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{mapping.metricDefinition.name}</p>
          <p className="font-mono text-sm text-zinc-500">{mapping.metricDefinition.key}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {mapping.metricDefinition.valueType}
            {mapping.metricDefinition.canonicalUnit
              ? ` · ${mapping.metricDefinition.canonicalUnit}`
              : ""}
          </p>
        </div>
      </div>

      <form
        action={formAction}
        className="mt-4 space-y-3"
        key={`${mapping.id}-${mapping.required}-${mapping.sortOrder}`}
      >
        <input type="hidden" name="eventItemTypeId" value={eventItemTypeId} />
        <input type="hidden" name="eventItemTypeMetricDefinitionId" value={mapping.id} />
        <FormMessage error={state.error} success={state.success} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-zinc-300">Sort order</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={mapping.sortOrder}
              className={`${inputClassName} w-28`}
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-zinc-300">
            <input type="hidden" name="required" value="false" />
            <input
              name="required"
              type="checkbox"
              value="true"
              defaultChecked={mapping.required}
              className="rounded border-white/20 bg-[#1c222c]"
            />
            Required
          </label>
          <SubmitButton variant="secondary">Update</SubmitButton>
        </div>
      </form>

      <form action={deleteEventItemTypeMetricAction} className="mt-3">
        <input type="hidden" name="eventItemTypeId" value={eventItemTypeId} />
        <input type="hidden" name="eventItemTypeMetricDefinitionId" value={mapping.id} />
        <SubmitButton variant="danger">Remove</SubmitButton>
      </form>
    </li>
  );
}

type EventItemTypeMetricsSectionProps = {
  eventItemTypeId: string;
  mappings: EventItemTypeMetricDefinition[];
  availableMetrics: MetricDefinition[];
};

export function EventItemTypeMetricsSection({
  eventItemTypeId,
  mappings,
  availableMetrics,
}: EventItemTypeMetricsSectionProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">Allowed metrics ({mappings.length})</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Metrics available when logging this item type on nested event items.
            </p>
          </div>
          {availableMetrics.length > 0 ? (
            <AdminCreateModal title="Allow metric" buttonLabel="Allow metric">
              <AddEventItemTypeMetricForm
                eventItemTypeId={eventItemTypeId}
                availableMetrics={availableMetrics}
              />
            </AdminCreateModal>
          ) : null}
        </div>

        {availableMetrics.length === 0 && mappings.length > 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            All compatible metrics are already allowed for this item type.
          </p>
        ) : null}

        {mappings.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">No metrics allowed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {mappings.map((mapping) => (
              <EventItemTypeMetricRow
                key={mapping.id}
                eventItemTypeId={eventItemTypeId}
                mapping={mapping}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
