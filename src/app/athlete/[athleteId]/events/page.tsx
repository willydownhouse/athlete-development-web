import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EventsListSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { EventsListFilters } from "@/components/dashboard/events-list-filters";
import { EventsListSection } from "@/components/dashboard/events-list-section";
import { fetchEventTypes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import {
  eventsListFilterKey,
  eventsListSuspenseKey,
  parseEventsListSearchParams,
  resolveEventsListSearchParams,
} from "@/lib/events-list-params";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

type AthleteEventsPageProps = {
  params: Promise<{ athleteId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AthleteEventsPage({ params, searchParams }: AthleteEventsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await params;
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    redirect("/dashboard");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [athletes, rawSearchParams, isAdmin, timeZone] = await Promise.all([
    loadShellAthletes(token),
    searchParams,
    getIsAdminUser(),
    getRequestTimeZone(),
  ]);

  const listParams = resolveEventsListSearchParams(
    parseEventsListSearchParams(rawSearchParams),
    timeZone,
  );

  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const eventTypes = await fetchEventTypes(selectedAthlete.focusSportId).catch(() => []);

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-28 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Events</h1>

        <div className="mt-6 space-y-4">
          <EventsListFilters
            key={eventsListFilterKey(listParams)}
            eventTypes={eventTypes}
            focusSportName={selectedAthlete.focusSport.name}
            params={listParams}
          />

          <Suspense key={eventsListSuspenseKey(listParams)} fallback={<EventsListSkeleton />}>
            <EventsListSection athleteId={normalizedAthleteId} params={listParams} />
          </Suspense>
        </div>
      </div>

      <DashboardBottomNav />
    </DashboardShell>
  );
}
