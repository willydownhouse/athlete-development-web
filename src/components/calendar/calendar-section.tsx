"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { copyDayEventsAction, fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { CalendarDayEvents } from "@/components/dashboard/calendar-day-events";
import { CopyEventsConfirmModal } from "@/components/dashboard/copy-events-confirm-modal";
import { CalendarMonthGrid } from "@/components/dashboard/calendar-month-grid";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { addLocalMonths, parseLocalDateString, startOfLocalDay } from "@/lib/date-range";
import { eventToCopySource } from "@/lib/copy-event";
import { datesWithEvents, eventsForLocalDate } from "@/lib/event-grouping";
import {
  getZonedDateString,
  getZonedMonthRange,
  getZonedMonthStartDateString,
  type TimeRange,
} from "@/lib/time-zone";
import type { Event } from "@/lib/types";

type CalendarSectionProps = {
  athleteId: string;
  timeZone: string;
  initialMonthEvents: Event[];
  loadedRange: TimeRange;
  initialSelectedDate: string;
  initialVisibleMonth: string;
  initialLoadError?: string | null;
};

function isViewingMonthStart(timeZone: string, visibleMonth: Date, monthStart: string): boolean {
  return getZonedMonthStartDateString(timeZone, visibleMonth) === monthStart;
}

function getTodayDates(timeZone: string) {
  const now = new Date();

  return {
    selected: parseLocalDateString(getZonedDateString(timeZone, now)),
    month: parseLocalDateString(getZonedMonthStartDateString(timeZone, now)),
  };
}

export function CalendarSection({
  athleteId,
  timeZone,
  initialMonthEvents,
  loadedRange,
  initialSelectedDate,
  initialVisibleMonth,
  initialLoadError = null,
}: CalendarSectionProps) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() =>
    parseLocalDateString(initialSelectedDate),
  );
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(() =>
    parseLocalDateString(initialVisibleMonth),
  );
  const [monthEvents, setMonthEvents] = useState(initialMonthEvents);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [isFetching, setIsFetching] = useState(false);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [copyConfirmKey, setCopyConfirmKey] = useState(0);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copyPending, startCopyTransition] = useTransition();
  const showLoading = useDelayedLoading(isFetching);
  const hasNavigatedAwayRef = useRef(false);

  const monthRange = useMemo(() => {
    if (isViewingMonthStart(timeZone, visibleCalendarMonth, initialVisibleMonth)) {
      return loadedRange;
    }

    return getZonedMonthRange(timeZone, visibleCalendarMonth);
  }, [timeZone, visibleCalendarMonth, initialVisibleMonth, loadedRange]);

  useEffect(() => {
    if (
      !hasNavigatedAwayRef.current &&
      isViewingMonthStart(timeZone, visibleCalendarMonth, initialVisibleMonth)
    ) {
      return;
    }

    let cancelled = false;
    setIsFetching(true);

    void fetchEventsInRangeAction(athleteId, monthRange.startedAtFrom, monthRange.startedAtTo).then(
      (result) => {
        if (cancelled) {
          return;
        }

        setMonthEvents(result.error ? [] : result.events);
        setLoadError(result.error ?? null);
        setIsFetching(false);
      },
    );

    return () => {
      cancelled = true;
      setIsFetching(false);
    };
  }, [
    athleteId,
    initialVisibleMonth,
    monthRange.startedAtFrom,
    monthRange.startedAtTo,
    timeZone,
    visibleCalendarMonth,
  ]);

  const isShowingToday = useMemo(() => {
    const today = getTodayDates(timeZone);

    return (
      visibleCalendarMonth.getTime() === today.month.getTime() &&
      selectedCalendarDate.getTime() === today.selected.getTime()
    );
  }, [timeZone, visibleCalendarMonth, selectedCalendarDate]);

  const daysWithEvents = useMemo(
    () => datesWithEvents(monthEvents, timeZone),
    [monthEvents, timeZone],
  );
  const selectedDayEvents = useMemo(
    () => eventsForLocalDate(monthEvents, selectedCalendarDate, timeZone),
    [monthEvents, selectedCalendarDate, timeZone],
  );

  function markMonthNavigation() {
    hasNavigatedAwayRef.current = true;
  }

  const handleGoToToday = useCallback(() => {
    markMonthNavigation();
    const today = getTodayDates(timeZone);
    setVisibleCalendarMonth(today.month);
    setSelectedCalendarDate(today.selected);
  }, [timeZone]);

  const navigateToDate = useCallback(
    (targetDate: string) => {
      markMonthNavigation();
      const date = parseLocalDateString(targetDate);
      setSelectedCalendarDate(date);
      setVisibleCalendarMonth(parseLocalDateString(getZonedMonthStartDateString(timeZone, date)));
    },
    [timeZone],
  );

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
        const result = await copyDayEventsAction(
          athleteId,
          selectedDayEvents.map(eventToCopySource),
          targetDate,
        );

        if ("error" in result) {
          setCopyError(result.error);
          return;
        }

        setCopyConfirmOpen(false);
        navigateToDate(targetDate);
      });
    },
    [athleteId, navigateToDate, selectedDayEvents],
  );

  function handleMonthChange(nextMonth: Date) {
    markMonthNavigation();
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
    <>
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
        <div className="flex items-center gap-3">
          <h2 className="hidden shrink-0 text-base font-semibold text-white sm:block">Calendar</h2>
          <div className="flex flex-1 items-center justify-center gap-1">
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
          <button
            type="button"
            onClick={handleGoToToday}
            disabled={isShowingToday}
            className="shrink-0 rounded-lg border border-white/10 bg-[#252b36] px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-[#2f3642] hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-[#252b36] disabled:hover:text-zinc-300"
          >
            Today
          </button>
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
          timeZone={timeZone}
          selectedDate={selectedCalendarDate}
          events={selectedDayEvents}
          loading={showLoading}
          loadError={loadError}
          onCopyClick={openCopyConfirm}
          copyDisabled={copyPending || selectedDayEvents.length === 0}
        />
      </section>

      <CopyEventsConfirmModal
        key={copyConfirmKey}
        open={copyConfirmOpen}
        onClose={closeCopyConfirm}
        timeZone={timeZone}
        eventCount={selectedDayEvents.length}
        pending={copyPending}
        error={copyError}
        onConfirm={handleCopyConfirm}
      />
    </>
  );
}
