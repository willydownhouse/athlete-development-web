"use client";

import { ThisWeekCard } from "@/components/dashboard/this-week-card";
import type { Event } from "@/lib/types";

import { useDashboardInteractions } from "./dashboard-interactions";

type ThisWeekCardClientProps = {
  events: Event[];
  loadError?: string | null;
};

export function ThisWeekCardClient({ events, loadError }: ThisWeekCardClientProps) {
  const { focusCalendarDate } = useDashboardInteractions();

  return <ThisWeekCard events={events} loadError={loadError} onDayClick={focusCalendarDate} />;
}
