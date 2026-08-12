import Link from "next/link";
import { Suspense } from "react";

import { loadDashboardEventsBundle } from "@/lib/dashboard-event-data";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import type { Athlete, EventType } from "@/lib/types";

import { athleteEventsThisWeekLabel } from "./athlete-meta";
import { CalendarSection } from "./calendar-section";
import { athleteEventsDayHref, athleteEventsWeekHref } from "./dashboard-nav";
import { DashboardInteractionsProvider } from "./dashboard-interactions";
import { DashboardHeader } from "./dashboard-header";
import { HockeyStats } from "./hockey-stats";
import { HockeyStatsSection } from "./hockey-stats-section";
import { QuickLogSection } from "./quick-log-section";
import {
  CalendarSectionSkeleton,
  HockeyStatsGridSkeleton,
  HockeyStatsSkeleton,
  TodaysEventsSkeleton,
} from "./dashboard-skeletons";
import { TodaysEventsCard } from "./todays-events-card";

const inlineSkeletonClassName =
  "inline-block h-4 w-36 animate-pulse rounded-lg bg-white/[0.07] align-middle";

type DashboardAthleteContentProps = {
  selectedAthlete: Athlete;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  statsPeriod: HockeyStatsPeriod;
};

async function DashboardWeekEventsMeta({
  athleteId,
  timeZone,
}: {
  athleteId: string;
  timeZone: string;
}) {
  const eventsBundle = await loadDashboardEventsBundle(athleteId, timeZone);
  const eventsLabel = athleteEventsThisWeekLabel(eventsBundle.weekEvents.length);

  return (
    <Link
      href={athleteEventsWeekHref(athleteId, timeZone)}
      className="transition hover:text-zinc-200"
    >
      {eventsLabel}
    </Link>
  );
}

async function DashboardTodaysEventsSection({
  selectedAthlete,
  timeZone,
}: {
  selectedAthlete: Athlete;
  timeZone: string;
}) {
  const eventsBundle = await loadDashboardEventsBundle(selectedAthlete.id, timeZone);

  return (
    <TodaysEventsCard
      athleteId={selectedAthlete.id}
      events={eventsBundle.todayEvents}
      loadError={eventsBundle.error}
      eventsHref={athleteEventsDayHref(selectedAthlete.id, timeZone)}
    />
  );
}

async function DashboardCalendarSection({
  selectedAthlete,
  timeZone,
}: {
  selectedAthlete: Athlete;
  timeZone: string;
}) {
  const eventsBundle = await loadDashboardEventsBundle(selectedAthlete.id, timeZone);

  return (
    <CalendarSection
      athleteId={selectedAthlete.id}
      timeZone={timeZone}
      initialAllEvents={eventsBundle.allEvents}
      loadedRange={eventsBundle.loadedRange}
      initialLoadError={eventsBundle.error}
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
        eventsMeta={
          <Suspense fallback={<span aria-hidden="true" className={inlineSkeletonClassName} />}>
            <DashboardWeekEventsMeta athleteId={selectedAthlete.id} timeZone={timeZone} />
          </Suspense>
        }
      />
      <div className="mt-6 flex flex-col gap-3.5">
        <Suspense fallback={<TodaysEventsSkeleton />}>
          <DashboardTodaysEventsSection selectedAthlete={selectedAthlete} timeZone={timeZone} />
        </Suspense>
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
        <Suspense fallback={<CalendarSectionSkeleton />}>
          <DashboardCalendarSection selectedAthlete={selectedAthlete} timeZone={timeZone} />
        </Suspense>
      </div>
    </DashboardInteractionsProvider>
  );
}
