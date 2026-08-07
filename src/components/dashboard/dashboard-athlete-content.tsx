import { Suspense } from "react";

import {
  fetchDashboardEventsInRange,
  type DashboardEventsResult,
} from "@/lib/dashboard-event-data";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import { getZonedDayRange, getZonedWeekRange } from "@/lib/time-zone";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import type { Athlete, EventType } from "@/lib/types";

import { CalendarSection } from "./calendar-section";
import { athleteEventsWeekHref } from "./dashboard-nav";
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
  timeZone,
}: {
  selectedAthlete: Athlete;
  startedAtFrom: string;
  startedAtTo: string;
  timeZone: string;
}) {
  const weekResult = await fetchDashboardEventsInRange(
    selectedAthlete.id,
    startedAtFrom,
    startedAtTo,
  );
  const { events } = eventsFromResult(weekResult);

  return (
    <DashboardHeader
      selectedAthlete={selectedAthlete}
      eventsThisWeek={events.length}
      eventsWeekHref={athleteEventsWeekHref(selectedAthlete.id, timeZone)}
    />
  );
}

export async function DashboardAthleteContent({
  selectedAthlete,
  eventTypes,
  eventTypesError,
  statsPeriod,
}: DashboardAthleteContentProps) {
  const timeZone = await getRequestTimeZone();
  const todayRange = getZonedDayRange(timeZone);
  const weekRange = getZonedWeekRange(timeZone);

  return (
    <DashboardInteractionsProvider
      key={selectedAthlete.id}
      athleteId={selectedAthlete.id}
      eventTypes={eventTypes}
      focusSportName={selectedAthlete.focusSport.name}
      eventTypesError={eventTypesError}
    >
      <Suspense fallback={<DashboardHeaderSkeleton selectedAthlete={selectedAthlete} />}>
        <DashboardHeaderSection
          selectedAthlete={selectedAthlete}
          startedAtFrom={weekRange.startedAtFrom}
          startedAtTo={weekRange.startedAtTo}
          timeZone={timeZone}
        />
      </Suspense>
      <div className="mt-6 flex flex-col gap-3.5">
        <Suspense fallback={<TodaysEventsSkeleton />}>
          <TodaysEvents
            athleteId={selectedAthlete.id}
            startedAtFrom={todayRange.startedAtFrom}
            startedAtTo={todayRange.startedAtTo}
            timeZone={timeZone}
          />
        </Suspense>
        <QuickLogSection
          eventTypes={eventTypes}
          focusSportName={selectedAthlete.focusSport.name}
          eventTypesError={eventTypesError}
        />
        {selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG ? (
          <Suspense fallback={<HockeyStatsSkeleton />}>
            <HockeyStatsSection sportName={selectedAthlete.focusSport.name} period={statsPeriod}>
              <Suspense key={statsPeriod} fallback={<HockeyStatsGridSkeleton />}>
                <HockeyStats
                  athleteId={selectedAthlete.id}
                  sportId={selectedAthlete.focusSportId}
                  period={statsPeriod}
                  timeZone={timeZone}
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
