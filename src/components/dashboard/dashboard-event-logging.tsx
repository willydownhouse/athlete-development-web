"use client";

import { QuickLogCard } from "@/components/dashboard/quick-log-card";
import { TodaysEventsCard } from "@/components/dashboard/todays-events-card";
import type { Event, EventType } from "@/lib/types";

import { useDashboardInteractions } from "./dashboard-interactions";

type DashboardEventLoggingProps = {
  initialTodaysEvents: Event[];
  initialEventsError?: string | null;
  eventTypes: EventType[];
  eventTypesError?: string | null;
};

export function DashboardEventLogging({
  initialTodaysEvents,
  initialEventsError,
  eventTypes,
  eventTypesError,
}: DashboardEventLoggingProps) {
  const { openCreateModal, openEditModal } = useDashboardInteractions();

  return (
    <>
      <TodaysEventsCard
        events={initialTodaysEvents}
        loadError={initialEventsError}
        onAddClick={() => openCreateModal()}
        onEventClick={openEditModal}
      />
      <QuickLogCard
        eventTypes={eventTypes}
        loadError={eventTypesError}
        onEventTypeClick={(defaultEventTypeId) => openCreateModal({ defaultEventTypeId })}
      />
    </>
  );
}
