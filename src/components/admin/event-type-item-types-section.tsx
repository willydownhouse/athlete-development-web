"use client";

import { useActionState, useEffect } from "react";

import { AdminCreateModal, useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  createEventTypeItemTypeAction,
  deleteEventTypeItemTypeAction,
  updateEventTypeItemTypeAction,
  type ActionState,
} from "@/app/admin/actions";
import type { EventItemType, EventTypeItemType } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type AddEventTypeItemTypeFormProps = {
  eventTypeId: string;
  availableItemTypes: EventItemType[];
};

function AddEventTypeItemTypeForm({
  eventTypeId,
  availableItemTypes,
}: AddEventTypeItemTypeFormProps) {
  const [state, formAction] = useActionState(createEventTypeItemTypeAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventTypeId" value={eventTypeId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-300">Item type</span>
          <select name="eventItemTypeId" required className={inputClassName}>
            <option value="">Select an item type</option>
            {availableItemTypes.map((itemType) => (
              <option key={itemType.id} value={itemType.id}>
                {itemType.name} ({itemType.slug})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClassName} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input name="required" type="checkbox" className="rounded border-white/20 bg-[#1c222c]" />
        Required root item type
      </label>

      <SubmitButton>Allow item type</SubmitButton>
    </form>
  );
}

type EventTypeItemTypeRowProps = {
  eventTypeId: string;
  mapping: EventTypeItemType;
};

function EventTypeItemTypeRow({ eventTypeId, mapping }: EventTypeItemTypeRowProps) {
  const [state, formAction] = useActionState(updateEventTypeItemTypeAction, initialState);

  return (
    <li className="rounded-xl border border-white/10 bg-[#1c222c] p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{mapping.eventItemType.name}</p>
          <p className="font-mono text-sm text-zinc-500">{mapping.eventItemType.slug}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {mapping.eventItemType.sport?.name ?? "General"}
          </p>
        </div>
      </div>

      <form
        action={formAction}
        className="mt-4 space-y-3"
        key={`${mapping.id}-${mapping.required}-${mapping.sortOrder}`}
      >
        <input type="hidden" name="eventTypeId" value={eventTypeId} />
        <input type="hidden" name="eventTypeItemTypeId" value={mapping.id} />
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

      <form action={deleteEventTypeItemTypeAction} className="mt-3">
        <input type="hidden" name="eventTypeId" value={eventTypeId} />
        <input type="hidden" name="eventTypeItemTypeId" value={mapping.id} />
        <SubmitButton variant="danger">Remove</SubmitButton>
      </form>
    </li>
  );
}

type EventTypeItemTypesSectionProps = {
  eventTypeId: string;
  mappings: EventTypeItemType[];
  availableItemTypes: EventItemType[];
};

export function EventTypeItemTypesSection({
  eventTypeId,
  mappings,
  availableItemTypes,
}: EventTypeItemTypesSectionProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">
              Allowed root item types ({mappings.length})
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Root item types available when logging nested details for this event type.
            </p>
          </div>
          {availableItemTypes.length > 0 ? (
            <AdminCreateModal title="Allow item type" buttonLabel="Allow item type">
              <AddEventTypeItemTypeForm
                eventTypeId={eventTypeId}
                availableItemTypes={availableItemTypes}
              />
            </AdminCreateModal>
          ) : null}
        </div>

        {availableItemTypes.length === 0 && mappings.length > 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            All compatible item types are already allowed for this event type.
          </p>
        ) : null}

        {mappings.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">No root item types allowed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {mappings.map((mapping) => (
              <EventTypeItemTypeRow key={mapping.id} eventTypeId={eventTypeId} mapping={mapping} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
