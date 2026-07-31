"use client";

import { useTranslations } from "next-intl";

import { EventForm } from "@/components/dashboard/create-event-form";
import { Modal } from "@/components/ui/modal";
import type { Event, EventType } from "@/lib/types";

export type EventModalState =
  | { mode: "create"; defaultEventTypeId?: string; defaultEventDate?: string }
  | { mode: "edit"; event: Event }
  | null;

type EventFormModalProps = {
  athleteId: string;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  modalState: EventModalState;
  formKey: number;
  onClose: () => void;
  onSuccess: () => void;
};

export function EventFormModal({
  athleteId,
  eventTypes,
  eventTypesError,
  modalState,
  formKey,
  onClose,
  onSuccess,
}: EventFormModalProps) {
  const t = useTranslations("events.modal");
  const modalOpen = modalState !== null;
  const modalTitle = modalState?.mode === "edit" ? t("edit") : t("add");

  return (
    <Modal open={modalOpen} onClose={onClose} title={modalTitle} align="content">
      {eventTypesError ? (
        <p className="text-sm text-red-300">{eventTypesError}</p>
      ) : (
        <EventForm
          key={formKey}
          athleteId={athleteId}
          eventTypes={eventTypes}
          event={modalState?.mode === "edit" ? modalState.event : undefined}
          defaultEventTypeId={
            modalState?.mode === "create" ? modalState.defaultEventTypeId : undefined
          }
          defaultEventDate={modalState?.mode === "create" ? modalState.defaultEventDate : undefined}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
