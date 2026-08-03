import { Suspense } from "react";

import {
  fetchDashboardEventsInRange,
  type DashboardEventsResult,
} from "@/lib/dashboard-event-data";
import { getLocalDayRange, getLocalWeekRange } from "@/lib/date-range";
import type { Athlete, EventType } from "@/lib/types";

import { AiInsightCard } from "./ai-insight-card";
import { CalendarSection } from "./calendar-section";
import { DashboardInteractionsProvider } from "./dashboard-interactions";
import { DashboardEventLogging } from "./dashboard-event-logging";
import { DashboardHeader } from "./dashboard-header";
import { ThisWeekCard } from "./this-week-card";
import { ThisWeekCardClient } from "./this-week-card-client";

type DashboardAthleteContentProps = {
  selectedAthlete: Athlete;
  eventTypes: EventType[];
  eventTypesError?: string | null;
};

function eventsFromResult(result: DashboardEventsResult) {
  return {
    events: result.events,
    loadError: result.error ?? null,
  };
}

function DashboardSectionFallback({ title }: { title: string }) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <span className="text-sm text-zinc-500">Loading…</span>
      </div>
      <p className="mt-4 text-sm text-zinc-500">Loading {title.toLowerCase()}…</p>
    </section>
  );
}

async function DashboardHeaderSection({
  selectedAthlete,
  startedAtFrom,
  startedAtTo,
}: {
  selectedAthlete: Athlete;
  startedAtFrom: string;
  startedAtTo: string;
}) {
  const weekResult = await fetchDashboardEventsInRange(
    selectedAthlete.id,
    startedAtFrom,
    startedAtTo,
  );
  const { events } = eventsFromResult(weekResult);

  return <DashboardHeader selectedAthlete={selectedAthlete} eventsThisWeek={events.length} />;
}

async function DashboardEventLoggingSection({
  athleteId,
  startedAtFrom,
  startedAtTo,
  eventTypes,
  eventTypesError,
}: {
  athleteId: string;
  startedAtFrom: string;
  startedAtTo: string;
  eventTypes: EventType[];
  eventTypesError?: string | null;
}) {
  const todayResult = await fetchDashboardEventsInRange(athleteId, startedAtFrom, startedAtTo);
  const { events, loadError } = eventsFromResult(todayResult);

  return (
    <DashboardEventLogging
      initialTodaysEvents={events}
      initialEventsError={loadError}
      eventTypes={eventTypes}
      eventTypesError={eventTypesError}
    />
  );
}

async function ThisWeekSection({
  athleteId,
  startedAtFrom,
  startedAtTo,
}: {
  athleteId: string;
  startedAtFrom: string;
  startedAtTo: string;
}) {
  const weekResult = await fetchDashboardEventsInRange(athleteId, startedAtFrom, startedAtTo);
  const { events, loadError } = eventsFromResult(weekResult);

  return <ThisWeekCardClient events={events} loadError={loadError} />;
}

export function DashboardAthleteContent({
  selectedAthlete,
  eventTypes,
  eventTypesError,
}: DashboardAthleteContentProps) {
  const todayRange = getLocalDayRange();
  const weekRange = getLocalWeekRange();

  return (
    <DashboardInteractionsProvider
      key={selectedAthlete.id}
      athleteId={selectedAthlete.id}
      eventTypes={eventTypes}
      eventTypesError={eventTypesError}
    >
      <Suspense fallback={<DashboardHeader selectedAthlete={selectedAthlete} />}>
        <DashboardHeaderSection
          selectedAthlete={selectedAthlete}
          startedAtFrom={weekRange.startedAtFrom}
          startedAtTo={weekRange.startedAtTo}
        />
      </Suspense>
      <div className="mt-6 flex flex-col gap-3.5">
        <AiInsightCard />
        <Suspense fallback={<DashboardSectionFallback title="Today's events" />}>
          <DashboardEventLoggingSection
            athleteId={selectedAthlete.id}
            startedAtFrom={todayRange.startedAtFrom}
            startedAtTo={todayRange.startedAtTo}
            eventTypes={eventTypes}
            eventTypesError={eventTypesError}
          />
        </Suspense>
        <Suspense fallback={<ThisWeekCard events={[]} loading />}>
          <ThisWeekSection
            athleteId={selectedAthlete.id}
            startedAtFrom={weekRange.startedAtFrom}
            startedAtTo={weekRange.startedAtTo}
          />
        </Suspense>
        <CalendarSection athleteId={selectedAthlete.id} />
      </div>
    </DashboardInteractionsProvider>
  );
}
