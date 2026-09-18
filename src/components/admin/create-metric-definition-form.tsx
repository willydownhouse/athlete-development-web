"use client";

import { useActionState, useEffect } from "react";

import { useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { AdminFormSelect, sportScopeOptions } from "@/components/admin/admin-form-select";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createMetricDefinitionAction, type ActionState } from "@/app/admin/actions";
import { METRIC_VALUE_TYPES, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type CreateMetricDefinitionFormProps = {
  sports: Sport[];
};

export function CreateMetricDefinitionForm({ sports }: CreateMetricDefinitionFormProps) {
  const [state, formAction] = useActionState(createMetricDefinitionAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Key</span>
          <input
            name="key"
            required
            pattern="[a-z0-9_]+"
            placeholder="shot_count"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Name</span>
          <input name="name" required placeholder="Shot count" className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Value type</span>
          <AdminFormSelect
            name="valueType"
            required
            defaultValue={METRIC_VALUE_TYPES[0]}
            options={METRIC_VALUE_TYPES.map((valueType) => ({
              value: valueType,
              label: valueType,
            }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Canonical unit</span>
          <input name="canonicalUnit" placeholder="shots" className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sport</span>
          <AdminFormSelect
            name="sportId"
            defaultValue="general"
            options={sportScopeOptions(sports)}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">Description</span>
        <textarea
          name="description"
          rows={2}
          placeholder="Optional description for forms and AI tooling."
          className={inputClassName}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          defaultChecked
          className="rounded border-white/20 bg-[#1c222c]"
        />
        Active
      </label>

      <SubmitButton>Create metric definition</SubmitButton>
    </form>
  );
}
