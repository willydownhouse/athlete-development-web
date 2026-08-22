"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { copyEventAction } from "@/app/dashboard/actions";
import { CopyEventsConfirmModal } from "@/components/dashboard/copy-events-confirm-modal";
import { EventActionMenu } from "@/components/dashboard/event-action-menu";
import { EventDetailCard } from "@/components/dashboard/event-detail-card";
import { EventFormModal } from "@/components/dashboard/event-form-modal";
import { EventMediaUpload } from "@/components/dashboard/event-media-upload";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { eventToCopySource } from "@/lib/copy-event";
import type { Event, EventType } from "@/lib/types";

type EventCardActionsOptions = {
  athleteId: string;
  event: Event;
  timeZone: string;
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
  deleteRedirectTo?: string;
};

function useEventCardActions({
  athleteId,
  event,
  timeZone,
  eventTypes,
  focusSportName,
  eventTypesError,
  deleteRedirectTo,
}: EventCardActionsOptions) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [copyConfirmKey, setCopyConfirmKey] = useState(0);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [copyPending, startCopyTransition] = useTransition();
  const [mediaUploading, setMediaUploading] = useState(false);
  const [pickFileRequestId, setPickFileRequestId] = useState(0);

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

  const handleAddMedia = useCallback(() => {
    setPickFileRequestId((current) => current + 1);
  }, []);

  const menu = (
    <EventActionMenu
      onTriggerClick={(triggerEvent) => {
        triggerEvent.preventDefault();
        triggerEvent.stopPropagation();
      }}
      items={[
        { label: "Edit", onClick: openEditModal },
        { label: "Copy", onClick: openCopyConfirm },
        {
          label: mediaUploading ? "Uploading…" : "Add media",
          onClick: handleAddMedia,
          disabled: mediaUploading,
        },
      ]}
    />
  );

  const modals = (
    <>
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
          deleteRedirectTo={deleteRedirectTo ?? dashboardHref(athleteId)}
        />
      ) : null}
    </>
  );

  return {
    menu,
    modals,
    pickFileRequestId,
    setMediaUploading,
  };
}

export function EventDetailActionsLayout(props: EventCardActionsOptions) {
  const { athleteId, event, timeZone } = props;
  const { menu, modals, pickFileRequestId, setMediaUploading } = useEventCardActions(props);

  return (
    <>
      <EventDetailCard event={event} timeZone={timeZone} editAction={menu} />
      <div className="mt-4">
        <EventMediaUpload
          athleteId={athleteId}
          eventId={event.id}
          pickFileRequestId={pickFileRequestId}
          onUploadingChange={setMediaUploading}
        />
      </div>
      {modals}
    </>
  );
}
