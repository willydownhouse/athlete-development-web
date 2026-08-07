import { Suspense } from "react";

import { loadDashboardEventsBundle } from "@/lib/dashboard-event-data";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import type { Athlete, EventType } from "@/lib/types";

import { CalendarSection } from "./calendar-section";
import { athleteEventsDayHref, athleteEventsWeekHref } from "./dashboard-nav";
import { DashboardInteractionsProvider } from "./dashboard-interactions";
import { DashboardHeader } from "./dashboard-header";
import { HockeyStats } from "./hockey-stats";
import { HockeyStatsSection } from "./hockey-stats-section";
import { QuickLogSection } from "./quick-log-section";
import {
  DashboardEventsSkeleton,
  HockeyStatsGridSkeleton,
  HockeyStatsSkeleton,
} from "./dashboard-skeletons";
import { TodaysEventsCard } from "./todays-events-card";

type DashboardAthleteContentProps = {
  selectedAthlete: Athlete;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  statsPeriod: HockeyStatsPeriod;
};

async function DashboardAthleteBody({
  selectedAthlete,
  eventTypes,
  eventTypesError,
  statsPeriod,
}: DashboardAthleteContentProps) {
  const timeZone = await getRequestTimeZone();
  const eventsBundle = await loadDashboardEventsBundle(selectedAthlete.id, timeZone);

  return (
    <DashboardInteractionsProvider
      key={selectedAthlete.id}
      athleteId={selectedAthlete.id}
      eventTypes={eventTypes}
      focusSportName={selectedAthlete.focusSport.name}
      eventTypesError={eventTypesError}
    >
      <DashboardHeader
        selectedAthlete={selectedAthlete}
        eventsThisWeek={eventsBundle.weekEvents.length}
        eventsWeekHref={athleteEventsWeekHref(selectedAthlete.id, timeZone)}
      />
      <div className="mt-6 flex flex-col gap-3.5">
        <TodaysEventsCard
          athleteId={selectedAthlete.id}
          events={eventsBundle.todayEvents}
          loadError={eventsBundle.error}
          eventsHref={athleteEventsDayHref(selectedAthlete.id, timeZone)}
        />
        <QuickLogSection
          eventTypes={eventTypes}
          focusSportName={selectedAthlete.focusSport.name}
          eventTypesError={eventTypesError}
        />
        {selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG ? (
          <Suspense
            fallback={
              <HockeyStatsSkeleton
                sportName={selectedAthlete.focusSport.name}
                period={statsPeriod}
              />
            }
          >
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

        <CalendarSection
          athleteId={selectedAthlete.id}
          timeZone={timeZone}
          initialAllEvents={eventsBundle.allEvents}
          loadedRange={eventsBundle.loadedRange}
          initialLoadError={eventsBundle.error}
        />
      </div>
    </DashboardInteractionsProvider>
  );
}

export async function DashboardAthleteContent(props: DashboardAthleteContentProps) {
  return (
    <Suspense fallback={<DashboardEventsSkeleton selectedAthlete={props.selectedAthlete} />}>
      <DashboardAthleteBody {...props} />
    </Suspense>
  );
}
