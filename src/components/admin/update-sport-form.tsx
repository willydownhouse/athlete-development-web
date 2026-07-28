"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateSportAction, type ActionState } from "@/app/admin/actions";
import type { Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

type UpdateSportFormProps = {
  sport: Sport;
};

export function UpdateSportForm({ sport }: UpdateSportFormProps) {
  const [state, formAction] = useActionState(updateSportAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sportId" value={sport.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Slug</span>
          <input
            name="slug"
            required
            defaultValue={sport.slug}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Name</span>
          <input name="name" required defaultValue={sport.name} className={inputClassName} />
        </label>
      </div>

      <input type="hidden" name="active" value="false" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={sport.active}
          className="rounded border-slate-300"
        />
        Active
      </label>

      <SubmitButton variant="secondary">Save changes</SubmitButton>
    </form>
  );
}
