"use client";

import { useState } from "react";

import type { Athlete, Event, EventType } from "@/lib/types";

import { AiInsightCard } from "./ai-insight-card";
import { DashboardEventLogging } from "./dashboard-event-logging";
import { DashboardHeader } from "./dashboard-header";
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
          onWeekEventsChange={setWeekEventsState}
        />
        <ThisWeekCard
          events={weekEventsState.events}
          loading={weekEventsState.loading}
          loadError={weekEventsState.loadError}
        />
      </div>
    </>
  );
}
