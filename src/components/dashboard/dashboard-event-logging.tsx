"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { EventForm } from "@/components/dashboard/create-event-form";
import { QuickLogCard } from "@/components/dashboard/quick-log-card";
import { TodaysEventsCard } from "@/components/dashboard/todays-events-card";
import { Modal } from "@/components/ui/modal";
import { getLocalDayRange, getLocalWeekRange } from "@/lib/date-range";
import type { Event, EventType } from "@/lib/types";

type DashboardEventLoggingProps = {
  athleteId: string;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  onWeekEventsChange?: (state: {
    events: Event[];
    loading: boolean;
    loadError: string | null;
  }) => void;
};

type EventModalState =
  { mode: "create"; defaultEventTypeId?: string } | { mode: "edit"; event: Event } | null;

async function loadTodaysEventsForAthlete(athleteId: string) {
  const { startedAtFrom, startedAtTo } = getLocalDayRange();
  return fetchEventsInRangeAction(athleteId, startedAtFrom, startedAtTo);
}

async function loadWeekEventsForAthlete(athleteId: string) {
  const { startedAtFrom, startedAtTo } = getLocalWeekRange();
  return fetchEventsInRangeAction(athleteId, startedAtFrom, startedAtTo);
}

export function DashboardEventLogging({
  athleteId,
  eventTypes,
  eventTypesError,
  onWeekEventsChange,
}: DashboardEventLoggingProps) {
  const [modalState, setModalState] = useState<EventModalState>(null);
  const [formKey, setFormKey] = useState(0);
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const notifyWeekEvents = useCallback(
    (events: Event[], loading: boolean, loadError: string | null) => {
      onWeekEventsChange?.({ events, loading, loadError });
    },
    [onWeekEventsChange],
  );

  const refreshEvents = useCallback(async () => {
    setEventsLoading(true);
    notifyWeekEvents([], true, null);

    const [todayResult, weekResult] = await Promise.all([
      loadTodaysEventsForAthlete(athleteId),
      loadWeekEventsForAthlete(athleteId),
    ]);

    if (todayResult.error) {
      setTodaysEvents([]);
      setEventsError(todayResult.error);
    } else {
      setTodaysEvents(todayResult.events);
      setEventsError(null);
    }

    if (weekResult.error) {
      notifyWeekEvents([], false, weekResult.error);
    } else {
      notifyWeekEvents(weekResult.events, false, null);
    }

    setEventsLoading(false);
  }, [athleteId, notifyWeekEvents]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      loadTodaysEventsForAthlete(athleteId),
      loadWeekEventsForAthlete(athleteId),
    ]).then(([todayResult, weekResult]) => {
      if (cancelled) {
        return;
      }

      if (todayResult.error) {
        setTodaysEvents([]);
        setEventsError(todayResult.error);
      } else {
        setTodaysEvents(todayResult.events);
        setEventsError(null);
      }

      if (weekResult.error) {
        notifyWeekEvents([], false, weekResult.error);
      } else {
        notifyWeekEvents(weekResult.events, false, null);
      }

      setEventsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [athleteId, notifyWeekEvents]);

  function openCreateModal(defaultEventTypeId?: string) {
    setModalState(defaultEventTypeId ? { mode: "create", defaultEventTypeId } : { mode: "create" });
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
    await refreshEvents();
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
