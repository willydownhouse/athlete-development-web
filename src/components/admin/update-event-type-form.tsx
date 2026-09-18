"use client";

import { useActionState } from "react";

import {
  AdminFormSelect,
  eventCategoryOptions,
  sportScopeOptions,
} from "@/components/admin/admin-form-select";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateEventTypeAction, type ActionState } from "@/app/admin/actions";
import { EVENT_CATEGORIES, type EventType, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type UpdateEventTypeFormProps = {
  eventType: EventType;
  sports: Sport[];
};

export function UpdateEventTypeForm({ eventType, sports }: UpdateEventTypeFormProps) {
  const [state, formAction] = useActionState(updateEventTypeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventTypeId" value={eventType.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Slug</span>
          <input
            name="slug"
            required
            defaultValue={eventType.slug}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Name</span>
          <input name="name" required defaultValue={eventType.name} className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Category</span>
          <AdminFormSelect
            name="category"
            defaultValue={eventType.category}
            options={eventCategoryOptions(EVENT_CATEGORIES)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sport</span>
          <AdminFormSelect
            name="sportId"
            defaultValue={eventType.sportId ?? "general"}
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
          defaultChecked={eventType.active}
          className="rounded border-white/20 bg-[#1c222c]"
        />
        Active
      </label>

      <SubmitButton>Save event type</SubmitButton>
    </form>
  );
}
