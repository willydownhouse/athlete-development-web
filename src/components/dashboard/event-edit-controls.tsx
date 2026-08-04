"use client";

import { useCallback, useState } from "react";

import { EventFormModal } from "@/components/dashboard/event-form-modal";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import type { Event, EventType } from "@/lib/types";

type EventEditControlsProps = {
  athleteId: string;
  event: Event;
  eventTypes: EventType[];
  eventTypesError?: string | null;
};

export function EventEditControls({
  athleteId,
  event,
  eventTypes,
  eventTypesError,
}: EventEditControlsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const openEditModal = useCallback(() => {
    setFormKey((current) => current + 1);
    setEditOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditOpen(false);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    setEditOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openEditModal}
        className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
      >
        Edit
      </button>
      <EventFormModal
        athleteId={athleteId}
        eventTypes={eventTypes}
        eventTypesError={eventTypesError}
        modalState={editOpen ? { mode: "edit", event } : null}
        formKey={formKey}
        onClose={closeEditModal}
        onSuccess={handleUpdateSuccess}
        deleteRedirectTo={dashboardHref(athleteId)}
      />
    </>
  );
}
