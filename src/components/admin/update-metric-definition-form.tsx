"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateMetricDefinitionAction, type ActionState } from "@/app/admin/actions";
import { METRIC_VALUE_TYPES, type MetricDefinition, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type UpdateMetricDefinitionFormProps = {
  metric: MetricDefinition;
  sports: Sport[];
};

export function UpdateMetricDefinitionForm({ metric, sports }: UpdateMetricDefinitionFormProps) {
  const [state, formAction] = useActionState(updateMetricDefinitionAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="metricDefinitionId" value={metric.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Key</span>
          <input
            name="key"
            required
            defaultValue={metric.key}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Name</span>
          <input name="name" required defaultValue={metric.name} className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Value type</span>
          <select name="valueType" defaultValue={metric.valueType} className={inputClassName}>
            {METRIC_VALUE_TYPES.map((valueType) => (
              <option key={valueType} value={valueType}>
                {valueType}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Canonical unit</span>
          <input
            name="canonicalUnit"
            defaultValue={metric.canonicalUnit ?? ""}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sport</span>
          <select
            name="sportId"
            defaultValue={metric.sportId ?? "general"}
            className={inputClassName}
          >
            <option value="general">General (all sports)</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">Description</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={metric.description ?? ""}
          className={inputClassName}
        />
      </label>

      <input type="hidden" name="active" value="false" />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={metric.active}
          className="rounded border-white/20 bg-[#1c222c]"
        />
        Active
      </label>

      <SubmitButton variant="secondary">Save changes</SubmitButton>
    </form>
  );
}
