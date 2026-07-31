"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { QuickLogCard } from "@/components/dashboard/quick-log-card";
import { TodaysEventsCard } from "@/components/dashboard/todays-events-card";
import { getLocalDayRange, getLocalWeekRange } from "@/lib/date-range";
import type { Event, EventType } from "@/lib/types";

type DashboardEventLoggingProps = {
  athleteId: string;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  refreshKey: number;
  onWeekEventsChange?: (state: {
    events: Event[];
    loading: boolean;
    loadError: string | null;
  }) => void;
  onAddClick?: (options?: { defaultEventTypeId?: string }) => void;
  onEventClick?: (event: Event) => void;
};

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
  refreshKey,
  onWeekEventsChange,
  onAddClick,
  onEventClick,
}: DashboardEventLoggingProps) {
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const notifyWeekEvents = useCallback(
    (events: Event[], loading: boolean, loadError: string | null) => {
      onWeekEventsChange?.({ events, loading, loadError });
    },
    [onWeekEventsChange],
  );

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
  }, [athleteId, notifyWeekEvents, refreshKey]);

  return (
    <>
      <TodaysEventsCard
        events={todaysEvents}
        loading={eventsLoading}
        loadError={eventsError}
        onAddClick={() => onAddClick?.()}
        onEventClick={onEventClick}
      />
      <QuickLogCard
        eventTypes={eventTypes}
        loadError={eventTypesError}
        onEventTypeClick={(defaultEventTypeId) => onAddClick?.({ defaultEventTypeId })}
      />
    </>
  );
}
