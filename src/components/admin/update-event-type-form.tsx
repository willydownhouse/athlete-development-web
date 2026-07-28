"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateEventTypeAction, type ActionState } from "@/app/admin/actions";
import { EVENT_CATEGORIES, formatCategoryLabel, type EventType, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

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
          <span className="font-medium text-slate-700">Slug</span>
          <input
            name="slug"
            required
            defaultValue={eventType.slug}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Name</span>
          <input name="name" required defaultValue={eventType.name} className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Category</span>
          <select name="category" defaultValue={eventType.category} className={inputClassName}>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Sport</span>
          <select
            name="sportId"
            defaultValue={eventType.sportId ?? "general"}
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

      <input type="hidden" name="active" value="false" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={eventType.active}
          className="rounded border-slate-300"
        />
        Active
      </label>

      <SubmitButton>Save event type</SubmitButton>
    </form>
  );
}
