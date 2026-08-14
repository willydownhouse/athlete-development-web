"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { copyEventForTodayAction } from "@/app/dashboard/actions";
import { EventFormModal } from "@/components/dashboard/event-form-modal";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { Modal } from "@/components/ui/modal";
import { eventMetricsToInputs } from "@/lib/event-metric-form";
import type { Event, EventType } from "@/lib/types";

type EventEditControlsProps = {
  athleteId: string;
  event: Event;
  timeZone: string;
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
};

export function EventEditControls({
  athleteId,
  event,
  timeZone,
  eventTypes,
  focusSportName,
  eventTypesError,
}: EventEditControlsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [copyPending, startCopyTransition] = useTransition();

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

  const openCopyConfirm = useCallback(() => {
    setCopyError(null);
    setCopyConfirmOpen(true);
  }, []);

  const closeCopyConfirm = useCallback(() => {
    if (copyPending) {
      return;
    }

    setCopyConfirmOpen(false);
    setCopyError(null);
  }, [copyPending]);

  const handleCopyConfirm = useCallback(() => {
    setCopyError(null);

    startCopyTransition(async () => {
      const result = await copyEventForTodayAction(athleteId, {
        eventTypeId: event.eventTypeId,
        title: event.title,
        description: event.description,
        durationSeconds: event.durationSeconds,
        intensity: event.intensity,
        metrics: eventMetricsToInputs(event.metrics ?? []),
      });

      if ("error" in result) {
        setCopyError(result.error);
        return;
      }

      setCopyConfirmOpen(false);
      router.push(result.redirectTo);
    });
  }, [athleteId, event, router]);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={openCopyConfirm}
          className="rounded-lg border border-white/10 bg-[#252b36] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-[#2f3642] hover:text-white"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={openEditModal}
          className="rounded-lg bg-[#9ec9e8] px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#b7d7ec]"
        >
          Edit
        </button>
      </div>

      <Modal
        open={copyConfirmOpen}
        onClose={closeCopyConfirm}
        title="Copy for today?"
        align="content"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Create a new event for today with the same type, details, and metrics as this one?
          </p>
          {copyError ? <p className="text-sm text-red-300">{copyError}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeCopyConfirm}
              disabled={copyPending}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCopyConfirm}
              disabled={copyPending}
              className="inline-flex items-center justify-center rounded-xl bg-[#9ec9e8] px-4 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-[#b7d7ec] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copyPending ? "Copying…" : "Yes, copy for today"}
            </button>
          </div>
        </div>
      </Modal>

      {editOpen ? (
        <EventFormModal
          open={editOpen}
          athleteId={athleteId}
          timeZone={timeZone}
          eventTypes={eventTypes}
          focusSportName={focusSportName}
          eventTypesError={eventTypesError}
          modalState={{ mode: "edit", event }}
          formKey={formKey}
          onClose={closeEditModal}
          onSuccess={handleUpdateSuccess}
          deleteRedirectTo={dashboardHref(athleteId)}
        />
      ) : null}
    </>
  );
}
