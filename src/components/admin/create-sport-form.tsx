"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSportAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

export function CreateSportForm() {
  const [state, formAction] = useActionState(createSportAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Slug</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9_]+"
            placeholder="hockey"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Name</span>
          <input name="name" required placeholder="Hockey" className={inputClassName} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="active" type="checkbox" defaultChecked className="rounded border-slate-300" />
        Active
      </label>

      <SubmitButton>Create sport</SubmitButton>
    </form>
  );
}
