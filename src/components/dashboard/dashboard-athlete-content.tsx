"use client";

import { format } from "date-fns";
import { useCallback, useState } from "react";

import { startOfLocalDay } from "@/lib/date-range";
import type { Athlete, Event, EventType } from "@/lib/types";

import { AiInsightCard } from "./ai-insight-card";
import { CalendarSection } from "./calendar-section";
import { DashboardEventLogging } from "./dashboard-event-logging";
import { DashboardHeader } from "./dashboard-header";
import { EventFormModal, type EventModalState } from "./event-form-modal";
import { ThisWeekCard } from "./this-week-card";

type DashboardAthleteContentProps = {
  selectedAthlete: Athlete;
  eventTypes: EventType[];
  eventTypesError?: string | null;
};

type WeekEventsState = {
  events: Event[];
  loading: boolean;
  loadError: string | null;
};

export function DashboardAthleteContent({
  selectedAthlete,
  eventTypes,
  eventTypesError,
}: DashboardAthleteContentProps) {
  const [weekEventsState, setWeekEventsState] = useState<WeekEventsState>({
    events: [],
    loading: true,
    loadError: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalState, setModalState] = useState<EventModalState>(null);
  const [formKey, setFormKey] = useState(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() =>
    startOfLocalDay(new Date()),
  );
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(() =>
    startOfLocalDay(new Date()),
  );

  const openCreateModal = useCallback(
    (options?: { defaultEventTypeId?: string; defaultEventDate?: string }) => {
      setModalState({
        mode: "create",
        defaultEventTypeId: options?.defaultEventTypeId,
        defaultEventDate: options?.defaultEventDate,
      });
      setFormKey((current) => current + 1);
    },
    [],
  );

  const openEditModal = useCallback((event: Event) => {
    setModalState({ mode: "edit", event });
    setFormKey((current) => current + 1);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeModal();
    setRefreshKey((current) => current + 1);
  }, [closeModal]);

  const handleWeekDayClick = useCallback((date: Date) => {
    const nextDate = startOfLocalDay(date);
    setSelectedCalendarDate(nextDate);
    setVisibleCalendarMonth(nextDate);
    document.getElementById("calendar-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleCalendarAddClick = useCallback(
    (date: Date) => {
      openCreateModal({ defaultEventDate: format(date, "yyyy-MM-dd") });
    },
    [openCreateModal],
  );

  return (
    <>
      <DashboardHeader
        selectedAthlete={selectedAthlete}
        eventsThisWeek={weekEventsState.events.length}
      />
      <div className="mt-6 flex flex-col gap-3.5">
        <AiInsightCard />
        <DashboardEventLogging
          athleteId={selectedAthlete.id}
          eventTypes={eventTypes}
          eventTypesError={eventTypesError}
          refreshKey={refreshKey}
          onWeekEventsChange={setWeekEventsState}
          onAddClick={openCreateModal}
          onEventClick={openEditModal}
        />
        <ThisWeekCard
          events={weekEventsState.events}
          loading={weekEventsState.loading}
          loadError={weekEventsState.loadError}
          onDayClick={handleWeekDayClick}
        />
        <CalendarSection
          athleteId={selectedAthlete.id}
          refreshKey={refreshKey}
          selectedDate={selectedCalendarDate}
          visibleMonth={visibleCalendarMonth}
          onSelectedDateChange={setSelectedCalendarDate}
          onVisibleMonthChange={setVisibleCalendarMonth}
          onAddClick={handleCalendarAddClick}
          onEventClick={openEditModal}
        />
      </div>

      <EventFormModal
        athleteId={selectedAthlete.id}
        eventTypes={eventTypes}
        eventTypesError={eventTypesError}
        modalState={modalState}
        formKey={formKey}
        onClose={closeModal}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
