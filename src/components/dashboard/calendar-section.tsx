"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { fetchEventsInRangeAction } from "@/app/dashboard/actions";
import { CalendarDayEvents } from "@/components/dashboard/calendar-day-events";
import { CalendarMonthGrid } from "@/components/dashboard/calendar-month-grid";
import { getLocalMonthRange, startOfLocalDay, addLocalMonths } from "@/lib/date-range";
import { datesWithEvents, eventsForLocalDate } from "@/lib/event-grouping";
import type { Event } from "@/lib/types";

type CalendarSectionProps = {
  athleteId: string;
  refreshKey: number;
  selectedDate: Date;
  visibleMonth: Date;
  onSelectedDateChange: (date: Date) => void;
  onVisibleMonthChange: (month: Date) => void;
  onAddClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
};

export function CalendarSection({
  athleteId,
  refreshKey,
  selectedDate,
  visibleMonth,
  onSelectedDateChange,
  onVisibleMonthChange,
  onAddClick,
  onEventClick,
}: CalendarSectionProps) {
  const t = useTranslations("dashboard.calendar");
  const tAria = useTranslations("aria");
  const [monthEvents, setMonthEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const { startedAtFrom, startedAtTo } = getLocalMonthRange(visibleMonth);

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
  }, [athleteId, visibleMonth, refreshKey]);

  const daysWithEvents = useMemo(() => datesWithEvents(monthEvents), [monthEvents]);
  const selectedDayEvents = useMemo(
    () => eventsForLocalDate(monthEvents, selectedDate),
    [monthEvents, selectedDate],
  );

  function handleMonthChange(nextMonth: Date) {
    setLoading(true);
    onVisibleMonthChange(startOfLocalDay(nextMonth));
  }

  function handlePreviousMonth() {
    handleMonthChange(addLocalMonths(visibleMonth, -1));
  }

  function handleNextMonth() {
    handleMonthChange(addLocalMonths(visibleMonth, 1));
  }

  function handleSelect(date: Date) {
    onSelectedDateChange(startOfLocalDay(date));
  }

  return (
    <section id="calendar-section" className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{t("title")}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePreviousMonth}
            aria-label={tAria("previousMonth")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-lg leading-none text-zinc-300 transition hover:bg-[#2f3642] hover:text-white"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-sm capitalize text-zinc-200">
            {format(visibleMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label={tAria("nextMonth")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-lg leading-none text-zinc-300 transition hover:bg-[#2f3642] hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-4">
        <CalendarMonthGrid
          month={visibleMonth}
          selected={selectedDate}
          onSelect={handleSelect}
          daysWithEvents={daysWithEvents}
        />
      </div>

      <CalendarDayEvents
        selectedDate={selectedDate}
        events={selectedDayEvents}
        loading={loading}
        loadError={loadError}
        onAddClick={() => onAddClick(selectedDate)}
        onEventClick={onEventClick}
      />
    </section>
  );
}
