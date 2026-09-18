import { cache } from "react";

import { fetchDashboardEventsInRange } from "@/lib/dashboard-event-data";
import {
  getZonedDateString,
  getZonedMonthRange,
  getZonedMonthStartDateString,
  type TimeRange,
} from "@/lib/time-zone";
import type { Event } from "@/lib/types";

export const CALENDAR_EVENTS_INCLUDE = "metrics,items" as const;

export type CalendarMonthEvents = {
  events: Event[];
  monthRange: TimeRange;
  selectedDate: string;
  visibleMonth: string;
  error: string | null;
};

export const loadCalendarMonthEvents = cache(
  async (athleteId: string, timeZone: string): Promise<CalendarMonthEvents> => {
    const monthRange = getZonedMonthRange(timeZone);
    const result = await fetchDashboardEventsInRange(
      athleteId,
      monthRange.startedAtFrom,
      monthRange.startedAtTo,
      CALENDAR_EVENTS_INCLUDE,
    );

    return {
      events: result.events,
      monthRange,
      selectedDate: getZonedDateString(timeZone),
      visibleMonth: getZonedMonthStartDateString(timeZone),
      error: result.error ?? null,
    };
  },
);
