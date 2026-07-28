"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createMetricDefinitionAction, type ActionState } from "@/app/admin/actions";
import { METRIC_VALUE_TYPES, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

type CreateMetricDefinitionFormProps = {
  sports: Sport[];
};

export function CreateMetricDefinitionForm({ sports }: CreateMetricDefinitionFormProps) {
  const [state, formAction] = useActionState(createMetricDefinitionAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Key</span>
          <input
            name="key"
            required
            pattern="[a-z0-9_]+"
            placeholder="shot_count"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Name</span>
          <input name="name" required placeholder="Shot count" className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Value type</span>
          <select name="valueType" required className={inputClassName}>
            {METRIC_VALUE_TYPES.map((valueType) => (
              <option key={valueType} value={valueType}>
                {valueType}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Canonical unit</span>
          <input name="canonicalUnit" placeholder="shots" className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Sport</span>
          <select name="sportId" defaultValue="" className={inputClassName}>
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
        <span className="font-medium text-slate-700">Description</span>
        <textarea
          name="description"
          rows={2}
          placeholder="Optional description for forms and AI tooling."
          className={inputClassName}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="active" type="checkbox" defaultChecked className="rounded border-slate-300" />
        Active
      </label>

      <SubmitButton>Create metric definition</SubmitButton>
    </form>
  );
}
