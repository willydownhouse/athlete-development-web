import Link from "next/link";
import { Suspense } from "react";

import { loadDashboardEventsBundle } from "@/lib/dashboard-event-data";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { Athlete, EventType } from "@/lib/types";

import { athleteEventsThisWeekLabel } from "./athlete-meta";
import {
  athleteEventsDayHref,
  athleteCalendarHref,
  athleteEventsWeekHref,
  athleteStatsHref,
} from "./dashboard-nav";
import { DashboardInteractionsProvider } from "./dashboard-interactions";
import { DashboardHeader } from "./dashboard-header";
import { QuickLogSection } from "./quick-log-section";
import { TodaysEventsSkeleton } from "./dashboard-skeletons";
import { TodaysEventsCard } from "./todays-events-card";

const inlineSkeletonClassName =
  "inline-block h-4 w-36 animate-pulse rounded-lg bg-white/[0.07] align-middle";

type DashboardAthleteContentProps = {
  selectedAthlete: Athlete;
  eventTypes: EventType[];
  eventTypesError?: string | null;
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
      timeZone={timeZone}
      loadError={eventsBundle.error}
      eventsHref={athleteEventsDayHref(selectedAthlete.id, timeZone)}
    />
  );
}

export async function DashboardAthleteContent({
  selectedAthlete,
  eventTypes,
  eventTypesError,
}: DashboardAthleteContentProps) {
  const timeZone = await getRequestTimeZone();
  const statsHref =
    selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG
      ? athleteStatsHref(selectedAthlete.id)
      : undefined;

  return (
    <DashboardInteractionsProvider
      key={selectedAthlete.id}
      athleteId={selectedAthlete.id}
      timeZone={timeZone}
      eventTypes={eventTypes}
      focusSportName={selectedAthlete.focusSport.name}
      eventTypesError={eventTypesError}
    >
      <DashboardHeader
        selectedAthlete={selectedAthlete}
        calendarHref={athleteCalendarHref(selectedAthlete.id)}
        statsHref={statsHref}
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
      </div>
    </DashboardInteractionsProvider>
  );
}
