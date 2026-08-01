import { Suspense } from "react";

import {
  fetchDashboardEventsInRange,
  type DashboardEventsResult,
} from "@/lib/dashboard-event-data";
import { getLocalDayRange, getLocalMonthRange, getLocalWeekRange } from "@/lib/date-range";
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

type EventsPromise = Promise<DashboardEventsResult>;

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
  weekEventsPromise,
}: {
  selectedAthlete: Athlete;
  weekEventsPromise: EventsPromise;
}) {
  const weekResult = await weekEventsPromise;
  const { events } = eventsFromResult(weekResult);

  return <DashboardHeader selectedAthlete={selectedAthlete} eventsThisWeek={events.length} />;
}

async function DashboardEventLoggingSection({
  todayEventsPromise,
  eventTypes,
  eventTypesError,
}: {
  todayEventsPromise: EventsPromise;
  eventTypes: EventType[];
  eventTypesError?: string | null;
}) {
  const todayResult = await todayEventsPromise;
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

async function ThisWeekSection({ weekEventsPromise }: { weekEventsPromise: EventsPromise }) {
  const weekResult = await weekEventsPromise;
  const { events, loadError } = eventsFromResult(weekResult);

  return <ThisWeekCardClient events={events} loadError={loadError} />;
}

async function CalendarInitialSection({
  athleteId,
  monthEventsPromise,
}: {
  athleteId: string;
  monthEventsPromise: EventsPromise;
}) {
  const monthResult = await monthEventsPromise;
  const { events, loadError } = eventsFromResult(monthResult);

  return (
    <CalendarSection athleteId={athleteId} initialEvents={events} initialLoadError={loadError} />
  );
}

export function DashboardAthleteContent({
  selectedAthlete,
  eventTypes,
  eventTypesError,
}: DashboardAthleteContentProps) {
  const todayRange = getLocalDayRange();
  const weekRange = getLocalWeekRange();
  const monthRange = getLocalMonthRange();
  const todayEventsPromise = fetchDashboardEventsInRange(
    selectedAthlete.id,
    todayRange.startedAtFrom,
    todayRange.startedAtTo,
  );
  const weekEventsPromise = fetchDashboardEventsInRange(
    selectedAthlete.id,
    weekRange.startedAtFrom,
    weekRange.startedAtTo,
  );
  const monthEventsPromise = fetchDashboardEventsInRange(
    selectedAthlete.id,
    monthRange.startedAtFrom,
    monthRange.startedAtTo,
  );

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
          weekEventsPromise={weekEventsPromise}
        />
      </Suspense>
      <div className="mt-6 flex flex-col gap-3.5">
        <AiInsightCard />
        <Suspense fallback={<DashboardSectionFallback title="Today's events" />}>
          <DashboardEventLoggingSection
            todayEventsPromise={todayEventsPromise}
            eventTypes={eventTypes}
            eventTypesError={eventTypesError}
          />
        </Suspense>
        <Suspense fallback={<ThisWeekCard events={[]} loading />}>
          <ThisWeekSection weekEventsPromise={weekEventsPromise} />
        </Suspense>
        <Suspense fallback={<DashboardSectionFallback title="Calendar" />}>
          <CalendarInitialSection
            athleteId={selectedAthlete.id}
            monthEventsPromise={monthEventsPromise}
          />
        </Suspense>
      </div>
    </DashboardInteractionsProvider>
  );
}
