"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchTodaysEventsAction } from "@/app/dashboard/actions";
import { EventForm } from "@/components/dashboard/create-event-form";
import { QuickLogCard } from "@/components/dashboard/quick-log-card";
import { TodaysEventsCard } from "@/components/dashboard/todays-events-card";
import { Modal } from "@/components/ui/modal";
import { getLocalDayRange } from "@/lib/date-range";
import type { Event, EventType } from "@/lib/types";

type DashboardEventLoggingProps = {
  athleteId: string;
  eventTypes: EventType[];
  eventTypesError?: string | null;
};

type EventModalState =
  { mode: "create"; defaultEventTypeId?: string } | { mode: "edit"; event: Event } | null;

async function loadTodaysEventsForAthlete(athleteId: string) {
  const { startedAtFrom, startedAtTo } = getLocalDayRange();
  return fetchTodaysEventsAction(athleteId, startedAtFrom, startedAtTo);
}

export function DashboardEventLogging({
  athleteId,
  eventTypes,
  eventTypesError,
}: DashboardEventLoggingProps) {
  const [modalState, setModalState] = useState<EventModalState>(null);
  const [formKey, setFormKey] = useState(0);
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const refreshTodaysEvents = useCallback(async () => {
    const result = await loadTodaysEventsForAthlete(athleteId);

    if (result.error) {
      setTodaysEvents([]);
      setEventsError(result.error);
    } else {
      setTodaysEvents(result.events);
      setEventsError(null);
    }

    setEventsLoading(false);
  }, [athleteId]);

  useEffect(() => {
    let cancelled = false;

    void loadTodaysEventsForAthlete(athleteId).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.error) {
        setTodaysEvents([]);
        setEventsError(result.error);
      } else {
        setTodaysEvents(result.events);
        setEventsError(null);
      }

      setEventsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  function openCreateModal(defaultEventTypeId?: string) {
    setModalState({ mode: "create", defaultEventTypeId });
    setFormKey((current) => current + 1);
  }

  function openEditModal(event: Event) {
    setModalState({ mode: "edit", event });
    setFormKey((current) => current + 1);
  }

  function closeModal() {
    setModalState(null);
  }

  async function handleFormSuccess() {
    closeModal();
    setEventsLoading(true);
    await refreshTodaysEvents();
  }

  const modalOpen = modalState !== null;
  const modalTitle = modalState?.mode === "edit" ? "Edit event" : "Add event";

  return (
    <>
      <TodaysEventsCard
        events={todaysEvents}
        loading={eventsLoading}
        loadError={eventsError}
        onAddClick={() => openCreateModal()}
        onEventClick={openEditModal}
      />
      <QuickLogCard
        eventTypes={eventTypes}
        loadError={eventTypesError}
        onEventTypeClick={openCreateModal}
      />

      <Modal open={modalOpen} onClose={closeModal} title={modalTitle} align="content">
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
            onSuccess={() => {
              void handleFormSuccess();
            }}
          />
        )}
      </Modal>
    </>
  );
}
