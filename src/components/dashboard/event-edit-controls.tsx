"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { copyEventAction } from "@/app/dashboard/actions";
import { CopyEventsConfirmModal } from "@/components/dashboard/copy-events-confirm-modal";
import { EventFormModal } from "@/components/dashboard/event-form-modal";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { eventToCopySource } from "@/lib/copy-event";
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
  const [copyConfirmKey, setCopyConfirmKey] = useState(0);
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
    setCopyConfirmKey((current) => current + 1);
    setCopyConfirmOpen(true);
  }, []);

  const closeCopyConfirm = useCallback(() => {
    if (copyPending) {
      return;
    }

    setCopyConfirmOpen(false);
    setCopyError(null);
  }, [copyPending]);

  const handleCopyConfirm = useCallback(
    (targetDate: string) => {
      setCopyError(null);

      startCopyTransition(async () => {
        const result = await copyEventAction(athleteId, eventToCopySource(event), targetDate);

        if ("error" in result) {
          setCopyError(result.error);
          return;
        }

        setCopyConfirmOpen(false);
        router.push(result.redirectTo);
      });
    },
    [athleteId, event, router],
  );

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

      <CopyEventsConfirmModal
        key={copyConfirmKey}
        open={copyConfirmOpen}
        onClose={closeCopyConfirm}
        timeZone={timeZone}
        eventCount={1}
        pending={copyPending}
        error={copyError}
        onConfirm={handleCopyConfirm}
      />

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
