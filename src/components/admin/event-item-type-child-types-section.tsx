"use client";

import { useActionState, useEffect } from "react";

import { AdminCreateModal, useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { AdminFormSelect } from "@/components/admin/admin-form-select";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  createEventItemTypeChildTypeAction,
  deleteEventItemTypeChildTypeAction,
  updateEventItemTypeChildTypeAction,
  type ActionState,
} from "@/app/admin/actions";
import type { EventItemType, EventItemTypeChildType } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type AddEventItemTypeChildTypeFormProps = {
  eventItemTypeId: string;
  availableChildItemTypes: EventItemType[];
};

function AddEventItemTypeChildTypeForm({
  eventItemTypeId,
  availableChildItemTypes,
}: AddEventItemTypeChildTypeFormProps) {
  const [state, formAction] = useActionState(createEventItemTypeChildTypeAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventItemTypeId" value={eventItemTypeId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-300">Child item type</span>
          <AdminFormSelect
            name="childEventItemTypeId"
            required
            placeholder="Select a child item type"
            options={availableChildItemTypes.map((itemType) => ({
              value: itemType.id,
              label: `${itemType.name} (${itemType.slug})`,
            }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClassName} />
        </label>
      </div>

      <SubmitButton>Allow child item type</SubmitButton>
    </form>
  );
}

type EventItemTypeChildTypeRowProps = {
  eventItemTypeId: string;
  mapping: EventItemTypeChildType;
};

function EventItemTypeChildTypeRow({ eventItemTypeId, mapping }: EventItemTypeChildTypeRowProps) {
  const [state, formAction] = useActionState(updateEventItemTypeChildTypeAction, initialState);

  return (
    <li className="rounded-xl border border-white/10 bg-[#1c222c] p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{mapping.childEventItemType.name}</p>
          <p className="font-mono text-sm text-zinc-500">{mapping.childEventItemType.slug}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {mapping.childEventItemType.sport?.name ?? "General"}
          </p>
        </div>
      </div>

      <form
        action={formAction}
        className="mt-4 space-y-3"
        key={`${mapping.id}-${mapping.sortOrder}`}
      >
        <input type="hidden" name="eventItemTypeId" value={eventItemTypeId} />
        <input type="hidden" name="eventItemTypeChildTypeId" value={mapping.id} />
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
          <SubmitButton variant="secondary">Update</SubmitButton>
        </div>
      </form>

      <form action={deleteEventItemTypeChildTypeAction} className="mt-3">
        <input type="hidden" name="eventItemTypeId" value={eventItemTypeId} />
        <input type="hidden" name="eventItemTypeChildTypeId" value={mapping.id} />
        <SubmitButton variant="danger">Remove</SubmitButton>
      </form>
    </li>
  );
}

type EventItemTypeChildTypesSectionProps = {
  eventItemTypeId: string;
  mappings: EventItemTypeChildType[];
  availableChildItemTypes: EventItemType[];
};

export function EventItemTypeChildTypesSection({
  eventItemTypeId,
  mappings,
  availableChildItemTypes,
}: EventItemTypeChildTypesSectionProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">
              Allowed child item types ({mappings.length})
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Child item types that can be nested under this parent when logging events.
            </p>
          </div>
          {availableChildItemTypes.length > 0 ? (
            <AdminCreateModal title="Allow child item type" buttonLabel="Allow child item type">
              <AddEventItemTypeChildTypeForm
                eventItemTypeId={eventItemTypeId}
                availableChildItemTypes={availableChildItemTypes}
              />
            </AdminCreateModal>
          ) : null}
        </div>

        {availableChildItemTypes.length === 0 && mappings.length > 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            All compatible child item types are already allowed under this parent.
          </p>
        ) : null}

        {mappings.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">No child item types allowed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {mappings.map((mapping) => (
              <EventItemTypeChildTypeRow
                key={mapping.id}
                eventItemTypeId={eventItemTypeId}
                mapping={mapping}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
