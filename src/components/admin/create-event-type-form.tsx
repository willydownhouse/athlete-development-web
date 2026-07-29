"use client";

import { useActionState, useEffect } from "react";

import { useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createEventTypeAction, type ActionState } from "@/app/admin/actions";
import { EVENT_CATEGORIES, formatCategoryLabel, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type CreateEventTypeFormProps = {
  sports: Sport[];
};

export function CreateEventTypeForm({ sports }: CreateEventTypeFormProps) {
  const [state, formAction] = useActionState(createEventTypeAction, initialState);
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
          <span className="font-medium text-zinc-300">Slug</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9_]+"
            placeholder="ice_practice"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Name</span>
          <input name="name" required placeholder="Ice practice" className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Category</span>
          <select name="category" required className={inputClassName}>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sport</span>
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

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          defaultChecked
          className="rounded border-white/20 bg-[#1c222c]"
        />
        Active
      </label>

      <SubmitButton>Create event type</SubmitButton>
    </form>
  );
}
