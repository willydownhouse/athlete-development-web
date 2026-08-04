"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import { fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { CalendarDayEvents } from "@/components/dashboard/calendar-day-events";
import { CalendarMonthGrid } from "@/components/dashboard/calendar-month-grid";
import { getLocalMonthRange, startOfLocalDay, addLocalMonths } from "@/lib/date-range";
import { datesWithEvents, eventsForLocalDate } from "@/lib/event-grouping";
import type { Event } from "@/lib/types";

import { useDashboardInteractions } from "./dashboard-interactions";

type CalendarSectionProps = {
  athleteId: string;
};

export function CalendarSection({ athleteId }: CalendarSectionProps) {
  const {
    selectedCalendarDate,
    visibleCalendarMonth,
    refreshKey,
    setSelectedCalendarDate,
    setVisibleCalendarMonth,
    openCreateModal,
  } = useDashboardInteractions();

  const [monthEvents, setMonthEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const { startedAtFrom, startedAtTo } = getLocalMonthRange(visibleCalendarMonth);

    void fetchEventsInRangeAction(athleteId, startedAtFrom, startedAtTo).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.error) {
        setMonthEvents([]);
        setLoadError(result.error);
      } else {
        setMonthEvents(result.events);
        setLoadError(null);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [athleteId, visibleCalendarMonth, refreshKey]);

  const daysWithEvents = useMemo(() => datesWithEvents(monthEvents), [monthEvents]);
  const selectedDayEvents = useMemo(
    () => eventsForLocalDate(monthEvents, selectedCalendarDate),
    [monthEvents, selectedCalendarDate],
  );

  function handleMonthChange(nextMonth: Date) {
    setLoading(true);
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
    <section id="calendar-section" className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
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
        loading={loading}
        loadError={loadError}
        onAddClick={() =>
          openCreateModal({ defaultEventDate: format(selectedCalendarDate, "yyyy-MM-dd") })
        }
      />
    </section>
  );
}
