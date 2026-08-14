"use client";

import { EventForm, type EventFormApplyHandlers } from "@/components/dashboard/create-event-form";
import { Modal } from "@/components/ui/modal";
import type { Event, EventType } from "@/lib/types";

type CreateEventModalState = {
  mode: "create";
  defaultEventTypeId?: string;
  defaultEventDate?: string;
};
type EditEventModalState = { mode: "edit"; event: Event };
type EventModalState = CreateEventModalState | EditEventModalState;

type EventFormModalProps = {
  open: boolean;
  keepMounted?: boolean;
  athleteId: string;
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
  modalState: EventModalState;
  formKey: number;
  onApplyHandlersReady?: (handlers: EventFormApplyHandlers) => void;
  onClose: () => void;
  onSuccess: () => void;
  onDeleteSuccess?: () => void;
  deleteRedirectTo?: string;
};

export function EventFormModal({
  open,
  keepMounted = false,
  athleteId,
  eventTypes,
  focusSportName,
  eventTypesError,
  modalState,
  formKey,
  onApplyHandlersReady,
  onClose,
  onSuccess,
  onDeleteSuccess,
  deleteRedirectTo,
}: EventFormModalProps) {
  if (!open && !keepMounted) {
    return null;
  }

  const modalTitle = modalState.mode === "edit" ? "Edit event" : "Add event";

  return (
    <Modal
      open={open}
      keepMounted={keepMounted}
      onClose={onClose}
      title={modalTitle}
      align="content"
    >
      {eventTypesError ? (
        <p className="text-sm text-red-300">{eventTypesError}</p>
      ) : (
        <EventForm
          key={formKey}
          athleteId={athleteId}
          eventTypes={eventTypes}
          focusSportName={focusSportName}
          event={modalState.mode === "edit" ? modalState.event : undefined}
          defaultEventTypeId={
            modalState.mode === "create" ? modalState.defaultEventTypeId : undefined
          }
          defaultEventDate={modalState.mode === "create" ? modalState.defaultEventDate : undefined}
          onApplyHandlersReady={modalState.mode === "create" ? onApplyHandlersReady : undefined}
          onSuccess={onSuccess}
          onDeleteSuccess={onDeleteSuccess}
          deleteRedirectTo={deleteRedirectTo}
        />
      )}
    </Modal>
  );
}

export type { CreateEventModalState };
