"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { CalendarDayEvents } from "@/components/dashboard/calendar-day-events";
import { CalendarMonthGrid } from "@/components/dashboard/calendar-month-grid";
import {
  EventFormModal,
  type CreateEventModalState,
} from "@/components/dashboard/event-form-modal";
import type { EventFormApplyHandlers } from "@/components/dashboard/create-event-form";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { addLocalMonths, parseLocalDateString, startOfLocalDay } from "@/lib/date-range";
import { datesWithEvents, eventsForLocalDate } from "@/lib/event-grouping";
import {
  getZonedDateString,
  getZonedMonthRange,
  getZonedMonthStartDateString,
  type TimeRange,
} from "@/lib/time-zone";
import type { Event, EventType } from "@/lib/types";

type CalendarSectionProps = {
  athleteId: string;
  timeZone: string;
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
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
  eventTypes,
  focusSportName,
  eventTypesError,
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
  const [modalState, setModalState] = useState<CreateEventModalState | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormMounted, setCreateFormMounted] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const createFormMountedRef = useRef(false);
  const applyHandlersRef = useRef<EventFormApplyHandlers | null>(null);
  const [monthEvents, setMonthEvents] = useState(initialMonthEvents);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [isFetching, setIsFetching] = useState(false);
  const showLoading = useDelayedLoading(isFetching);
  const hasNavigatedAwayRef = useRef(false);

  const monthRange = useMemo(() => {
    if (isViewingMonthStart(timeZone, visibleCalendarMonth, initialVisibleMonth)) {
      return loadedRange;
    }

    return getZonedMonthRange(timeZone, visibleCalendarMonth);
  }, [timeZone, visibleCalendarMonth, initialVisibleMonth, loadedRange]);

  const fetchMonthEvents = useCallback(
    async (startedAtFrom: string, startedAtTo: string) => {
      setIsFetching(true);

      try {
        const result = await fetchEventsInRangeAction(athleteId, startedAtFrom, startedAtTo);
        setMonthEvents(result.error ? [] : result.events);
        setLoadError(result.error ?? null);
      } finally {
        setIsFetching(false);
      }
    },
    [athleteId],
  );

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

  const daysWithEvents = useMemo(() => datesWithEvents(monthEvents), [monthEvents]);
  const selectedDayEvents = useMemo(
    () => eventsForLocalDate(monthEvents, selectedCalendarDate),
    [monthEvents, selectedCalendarDate],
  );

  const openCreateModal = useCallback(() => {
    const selectedDate = format(selectedCalendarDate, "yyyy-MM-dd");

    if (!createFormMountedRef.current) {
      setModalState({ mode: "create", defaultEventDate: selectedDate });
      setFormKey((current) => current + 1);
      setCreateFormMounted(true);
      createFormMountedRef.current = true;
    } else {
      applyHandlersRef.current?.applyDate(selectedDate);
    }

    setCreateModalOpen(true);
  }, [selectedCalendarDate]);

  const handleApplyHandlersReady = useCallback((handlers: EventFormApplyHandlers) => {
    applyHandlersRef.current = handlers;
  }, []);

  const closeModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setCreateModalOpen(false);
    setCreateFormMounted(false);
    createFormMountedRef.current = false;
    applyHandlersRef.current = null;
    setModalState(null);
    setFormKey((current) => current + 1);
    void fetchMonthEvents(monthRange.startedAtFrom, monthRange.startedAtTo);
  }, [fetchMonthEvents, monthRange.startedAtFrom, monthRange.startedAtTo]);

  useEffect(() => {
    if (!createModalOpen) {
      return;
    }

    applyHandlersRef.current?.applyDate(format(selectedCalendarDate, "yyyy-MM-dd"));
  }, [createModalOpen, selectedCalendarDate]);

  function markMonthNavigation() {
    hasNavigatedAwayRef.current = true;
  }

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

  function handleGoToToday() {
    markMonthNavigation();
    const today = getTodayDates(timeZone);
    setVisibleCalendarMonth(today.month);
    setSelectedCalendarDate(today.selected);
  }

  return (
    <>
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
        <div className="flex items-center gap-3">
          <h2 className="shrink-0 text-base font-semibold text-white">Calendar</h2>
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
          selectedDate={selectedCalendarDate}
          events={selectedDayEvents}
          loading={showLoading}
          loadError={loadError}
          onAddClick={openCreateModal}
        />
      </section>

      {createFormMounted && modalState ? (
        <EventFormModal
          open={createModalOpen}
          keepMounted
          athleteId={athleteId}
          eventTypes={eventTypes}
          focusSportName={focusSportName}
          eventTypesError={eventTypesError}
          modalState={modalState}
          formKey={formKey}
          onApplyHandlersReady={handleApplyHandlersReady}
          onClose={closeModal}
          onSuccess={handleFormSuccess}
        />
      ) : null}
    </>
  );
}
