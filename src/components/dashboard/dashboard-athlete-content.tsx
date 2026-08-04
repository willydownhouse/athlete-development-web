import { Suspense } from "react";

import {
  fetchDashboardEventsInRange,
  type DashboardEventsResult,
} from "@/lib/dashboard-event-data";
import { getLocalDayRange, getLocalWeekRange } from "@/lib/date-range";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import type { Athlete, EventType } from "@/lib/types";

import { CalendarSection } from "./calendar-section";
import { DashboardInteractionsProvider } from "./dashboard-interactions";
import { DashboardHeader } from "./dashboard-header";
import { HockeyStats } from "./hockey-stats";
import { HockeyStatsSection } from "./hockey-stats-section";
import { QuickLogSection } from "./quick-log-section";
import {
  DashboardHeaderSkeleton,
  HockeyStatsGridSkeleton,
  HockeyStatsSkeleton,
  TodaysEventsSkeleton,
} from "./dashboard-skeletons";
import { TodaysEvents } from "./todays-events";

type DashboardAthleteContentProps = {
  selectedAthlete: Athlete;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  statsPeriod: HockeyStatsPeriod;
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

export function DashboardAthleteContent({
  selectedAthlete,
  eventTypes,
  eventTypesError,
  statsPeriod,
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
        <Suspense fallback={<TodaysEventsSkeleton />}>
          <TodaysEvents
            athleteId={selectedAthlete.id}
            startedAtFrom={todayRange.startedAtFrom}
            startedAtTo={todayRange.startedAtTo}
          />
        </Suspense>
        <QuickLogSection eventTypes={eventTypes} eventTypesError={eventTypesError} />
        {selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG ? (
          <Suspense fallback={<HockeyStatsSkeleton />}>
            <HockeyStatsSection period={statsPeriod}>
              <Suspense key={statsPeriod} fallback={<HockeyStatsGridSkeleton />}>
                <HockeyStats
                  athleteId={selectedAthlete.id}
                  sportId={selectedAthlete.focusSportId}
                  period={statsPeriod}
                />
              </Suspense>
            </HockeyStatsSection>
          </Suspense>
        ) : null}

        <CalendarSection athleteId={selectedAthlete.id} />
      </div>
    </DashboardInteractionsProvider>
  );
}
