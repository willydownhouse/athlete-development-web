"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import { fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { CalendarDayEvents } from "@/components/dashboard/calendar-day-events";
import { CalendarMonthGrid } from "@/components/dashboard/calendar-month-grid";
import { addLocalMonths, startOfLocalDay } from "@/lib/date-range";
import { datesWithEvents, eventsForLocalDate, eventsInHalfOpenRange } from "@/lib/event-grouping";
import { getZonedMonthRange, isTimeRangeWithin, type TimeRange } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

import { useDashboardInteractions } from "./dashboard-interactions";

type CalendarSectionProps = {
  athleteId: string;
  timeZone: string;
  initialAllEvents: Event[];
  loadedRange: TimeRange;
  initialLoadError?: string | null;
};

type RemoteMonthFetchState = {
  requestKey: string;
  events: Event[];
  error: string | null;
};

export function CalendarSection({
  athleteId,
  timeZone,
  initialAllEvents,
  loadedRange,
  initialLoadError = null,
}: CalendarSectionProps) {
  const {
    selectedCalendarDate,
    visibleCalendarMonth,
    setSelectedCalendarDate,
    setVisibleCalendarMonth,
    openCreateModal,
  } = useDashboardInteractions();

  const monthRange = useMemo(
    () => getZonedMonthRange(timeZone, visibleCalendarMonth),
    [timeZone, visibleCalendarMonth],
  );
  const shouldFetchMonth = !isTimeRangeWithin(monthRange, loadedRange);
  const remoteRequestKey = `${athleteId}:${monthRange.startedAtFrom}:${monthRange.startedAtTo}`;

  const cachedMonthEvents = useMemo(
    () => eventsInHalfOpenRange(initialAllEvents, monthRange.startedAtFrom, monthRange.startedAtTo),
    [initialAllEvents, monthRange],
  );

  const [remoteFetchState, setRemoteFetchState] = useState<RemoteMonthFetchState | null>(null);

  useEffect(() => {
    if (!shouldFetchMonth) {
      return;
    }

    let cancelled = false;

    void fetchEventsInRangeAction(athleteId, monthRange.startedAtFrom, monthRange.startedAtTo).then(
      (result) => {
        if (cancelled) {
          return;
        }

        setRemoteFetchState({
          requestKey: remoteRequestKey,
          events: result.error ? [] : result.events,
          error: result.error ?? null,
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [athleteId, monthRange, remoteRequestKey, shouldFetchMonth]);

  const remoteMonthEvents =
    remoteFetchState?.requestKey === remoteRequestKey ? remoteFetchState.events : null;
  const remoteLoadError =
    remoteFetchState?.requestKey === remoteRequestKey ? remoteFetchState.error : null;
  const loadingRemote = shouldFetchMonth && remoteMonthEvents === null;

  const monthEvents = useMemo(
    () => (shouldFetchMonth ? (remoteMonthEvents ?? []) : cachedMonthEvents),
    [cachedMonthEvents, remoteMonthEvents, shouldFetchMonth],
  );
  const displayLoadError = shouldFetchMonth ? remoteLoadError : initialLoadError;

  const daysWithEvents = useMemo(() => datesWithEvents(monthEvents), [monthEvents]);
  const selectedDayEvents = useMemo(
    () => eventsForLocalDate(monthEvents, selectedCalendarDate),
    [monthEvents, selectedCalendarDate],
  );

  function handleMonthChange(nextMonth: Date) {
    setVisibleCalendarMonth(startOfLocalDay(nextMonth));
  }

  function handlePreviousMonth() {
    handleMonthChange(addLocalMonths(visibleCalendarMonth, -1));
  }

  function handleNextMonth() {
    handleMonthChange(addLocalMonths(visibleCalendarMonth, 1));
  }

  function handleSelect(date: Date) {
    setSelectedCalendarDate(startOfLocalDay(date));
  }

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Calendar</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-lg leading-none text-zinc-300 transition hover:bg-[#2f3642] hover:text-white"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-sm capitalize text-zinc-200">
            {format(visibleCalendarMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-lg leading-none text-zinc-300 transition hover:bg-[#2f3642] hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-4">
        <CalendarMonthGrid
          month={visibleCalendarMonth}
          selected={selectedCalendarDate}
          onSelect={handleSelect}
          daysWithEvents={daysWithEvents}
        />
      </div>

      <CalendarDayEvents
        athleteId={athleteId}
        selectedDate={selectedCalendarDate}
        events={selectedDayEvents}
        loading={loadingRemote}
        loadError={displayLoadError}
        onAddClick={() =>
          openCreateModal({ defaultEventDate: format(selectedCalendarDate, "yyyy-MM-dd") })
        }
      />
    </section>
  );
}
