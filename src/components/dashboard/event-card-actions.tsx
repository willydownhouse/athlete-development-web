"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { copyEventAction, deleteEventMenuAction } from "@/app/dashboard/actions";
import { CopyEventsConfirmModal } from "@/components/dashboard/copy-events-confirm-modal";
import { DeleteEventConfirmModal } from "@/components/dashboard/delete-event-confirm-modal";
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
  const redirectTo = deleteRedirectTo ?? dashboardHref(athleteId);
  const [editOpen, setEditOpen] = useState(false);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [copyConfirmKey, setCopyConfirmKey] = useState(0);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [copyPending, startCopyTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
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

  const openDeleteConfirm = useCallback(() => {
    setDeleteError(null);
    setDeleteConfirmKey((current) => current + 1);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (deletePending) {
      return;
    }

    setDeleteConfirmOpen(false);
    setDeleteError(null);
  }, [deletePending]);

  const handleDeleteConfirm = useCallback(() => {
    setDeleteError(null);

    startDeleteTransition(async () => {
      const result = await deleteEventMenuAction(athleteId, event.id, redirectTo);

      setDeleteError(result.error);
    });
  }, [athleteId, event.id, redirectTo]);

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
        {
          label: "Delete",
          onClick: openDeleteConfirm,
          destructive: true,
          separatorBefore: true,
          disabled: deletePending,
        },
      ]}
    />
  );

  const modals = (
    <>
      <CopyEventsConfirmModal
        key={`copy-${copyConfirmKey}`}
        open={copyConfirmOpen}
        onClose={closeCopyConfirm}
        timeZone={timeZone}
        eventCount={1}
        pending={copyPending}
        error={copyError}
        onConfirm={handleCopyConfirm}
      />
      <DeleteEventConfirmModal
        key={`delete-${deleteConfirmKey}`}
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        pending={deletePending}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
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
