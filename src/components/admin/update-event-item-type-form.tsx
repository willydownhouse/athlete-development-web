"use client";

import { useActionState } from "react";

import { AdminFormSelect, sportScopeOptions } from "@/components/admin/admin-form-select";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateEventItemTypeAction, type ActionState } from "@/app/admin/actions";
import type { EventItemType, Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type UpdateEventItemTypeFormProps = {
  eventItemType: EventItemType;
  sports: Sport[];
};

export function UpdateEventItemTypeForm({ eventItemType, sports }: UpdateEventItemTypeFormProps) {
  const [state, formAction] = useActionState(updateEventItemTypeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventItemTypeId" value={eventItemType.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Slug</span>
          <input
            name="slug"
            required
            defaultValue={eventItemType.slug}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Name</span>
          <input
            name="name"
            required
            defaultValue={eventItemType.name}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-300">Sport</span>
          <AdminFormSelect
            name="sportId"
            defaultValue={eventItemType.sportId ?? "general"}
            options={sportScopeOptions(sports)}
          />
        </label>
      </div>

      <input type="hidden" name="active" value="false" />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={eventItemType.active}
          className="rounded border-white/20 bg-[#1c222c]"
        />
        Active
      </label>

      <SubmitButton variant="secondary">Save changes</SubmitButton>
    </form>
  );
}
