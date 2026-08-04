import { Suspense } from "react";

import {
  fetchDashboardEventsInRange,
  type DashboardEventsResult,
} from "@/lib/dashboard-event-data";
import { getLocalDayRange, getLocalWeekRange } from "@/lib/date-range";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { Athlete, EventType } from "@/lib/types";

import { CalendarSection } from "./calendar-section";
import { DashboardInteractionsProvider } from "./dashboard-interactions";
import { DashboardEventLogging } from "./dashboard-event-logging";
import { DashboardHeader } from "./dashboard-header";
import { HockeyStats } from "./hockey-stats";
import {
  DashboardEventLoggingSkeleton,
  DashboardHeaderSkeleton,
  HockeyStatsSkeleton,
  ThisWeekCardSkeleton,
} from "./dashboard-skeletons";
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
      <Suspense fallback={<DashboardHeaderSkeleton selectedAthlete={selectedAthlete} />}>
        <DashboardHeaderSection
          selectedAthlete={selectedAthlete}
          startedAtFrom={weekRange.startedAtFrom}
          startedAtTo={weekRange.startedAtTo}
        />
      </Suspense>
      <div className="mt-6 flex flex-col gap-3.5">
        <Suspense fallback={<DashboardEventLoggingSkeleton />}>
          <DashboardEventLoggingSection
            athleteId={selectedAthlete.id}
            startedAtFrom={todayRange.startedAtFrom}
            startedAtTo={todayRange.startedAtTo}
            eventTypes={eventTypes}
            eventTypesError={eventTypesError}
          />
        </Suspense>
        <Suspense fallback={<ThisWeekCardSkeleton />}>
          <ThisWeekSection
            athleteId={selectedAthlete.id}
            startedAtFrom={weekRange.startedAtFrom}
            startedAtTo={weekRange.startedAtTo}
          />
        </Suspense>
        {selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG ? (
          <Suspense fallback={<HockeyStatsSkeleton />}>
            <HockeyStats
              athleteId={selectedAthlete.id}
              sportId={selectedAthlete.focusSportId}
              startedAtFrom={weekRange.startedAtFrom}
              startedAtTo={weekRange.startedAtTo}
              periodLabel="This week"
            />
          </Suspense>
        ) : null}
        <CalendarSection athleteId={selectedAthlete.id} />
      </div>
    </DashboardInteractionsProvider>
  );
}
