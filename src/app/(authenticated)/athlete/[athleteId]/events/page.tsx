import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { EventsListSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { EventsListFilters } from "@/components/dashboard/events-list-filters";
import { EventsListSection } from "@/components/dashboard/events-list-section";
import {
  fetchEventItemTypes,
  fetchEventItemTypesChildTypes,
  fetchEventItemTypesMetricDefinitions,
  fetchEventTypes,
  fetchEventTypesMetricDefinitions,
} from "@/lib/api";
import { loadAccessibleAthlete } from "@/lib/accessible-athlete";
import { itemMeasureNumericMetricsFromCatalog } from "@/lib/events-list-metrics";
import {
  eventsListFilterKey,
  eventsListSuspenseKey,
  parseEventsListSearchParams,
  resolveEventsListSearchParams,
} from "@/lib/events-list-params";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import { getRequestTimeZone } from "@/lib/time-zone-server";

type AthleteEventsPageProps = {
  params: Promise<{ athleteId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AthleteEventsPage({ params, searchParams }: AthleteEventsPageProps) {
  const { athleteId } = await params;

  const [selectedAthlete, rawSearchParams, timeZone, locale] = await Promise.all([
    loadAccessibleAthlete(athleteId),
    searchParams,
    getRequestTimeZone(),
    getRequestLocale(),
  ]);

  const listParams = resolveEventsListSearchParams(
    parseEventsListSearchParams(rawSearchParams),
    timeZone,
  );

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const [eventTypes, eventTypeMetrics, itemTypes, itemTypeMetrics, itemTypeChildTypes] =
    await Promise.all([
      fetchEventTypes(locale, selectedAthlete.focusSportId).catch(() => []),
      fetchEventTypesMetricDefinitions(locale, selectedAthlete.focusSportId).catch(() => []),
      fetchEventItemTypes(locale, selectedAthlete.focusSportId).catch(() => []),
      fetchEventItemTypesMetricDefinitions(locale, selectedAthlete.focusSportId).catch(() => []),
      fetchEventItemTypesChildTypes(locale, selectedAthlete.focusSportId).catch(() => []),
    ]);
  const itemMeasureMetrics = itemMeasureNumericMetricsFromCatalog(
    itemTypes,
    itemTypeMetrics,
    itemTypeChildTypes,
    locale,
    selectedAthlete.focusSportId,
  );

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
      <Link
        href={dashboardHref(selectedAthlete.id)}
        className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
      >
        {backToTodayLabel(locale)}
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-white max-lg:sr-only lg:mt-4">
        {getMessages(locale).nav.history}
      </h1>

      <div className="mt-6 space-y-4">
        <EventsListFilters
          key={eventsListFilterKey(listParams)}
          eventTypes={eventTypes}
          eventTypeMetrics={eventTypeMetrics}
          itemTypes={itemTypes}
          itemMeasureMetrics={itemMeasureMetrics}
          focusSportName={selectedAthlete.focusSport.name}
          params={listParams}
        />

        <Suspense key={eventsListSuspenseKey(listParams)} fallback={<EventsListSkeleton />}>
          <EventsListSection
            athleteId={selectedAthlete.id}
            timeZone={timeZone}
            params={listParams}
            itemTypes={itemTypes}
            itemTypeChildTypes={itemTypeChildTypes}
          />
        </Suspense>
      </div>
    </div>
  );
}
