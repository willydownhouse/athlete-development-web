import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { ActivitySummary } from "@/components/dashboard/activity-summary";
import { ActivitySummarySection } from "@/components/dashboard/activity-summary-section";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HockeyStats } from "@/components/dashboard/hockey-stats";
import { HockeyStatsSection } from "@/components/dashboard/hockey-stats-section";
import {
  ActivitySummarySkeleton,
  HockeyStatsGridSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { StatsPeriodControls } from "@/components/dashboard/stats-period-controls";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";
import { getAuthBearerToken } from "@/lib/auth-token";
import {
  getStatsTimeRange,
  parseStatsSearchParams,
  statsRangeLocalDates,
  statsSuspenseKey,
} from "@/lib/stats-params";
import { getRequestTimeZone } from "@/lib/time-zone-server";

type AthleteStatsPageProps = {
  params: Promise<{ athleteId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AthleteStatsPage({ params, searchParams }: AthleteStatsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await params;
  const rawSearchParams = await searchParams;
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    redirect("/dashboard");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [athletes, isAdmin, timeZone] = await Promise.all([
    loadShellAthletes(token),
    getIsAdminUser(),
    getRequestTimeZone(),
  ]);

  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const listParams = parseStatsSearchParams(rawSearchParams);
  const range = getStatsTimeRange(listParams, timeZone);
  const localDates = statsRangeLocalDates(range, timeZone);
  const showHockeyStats = selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG;

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          {backToTodayLabel()}
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Stats</h1>
          <StatsPeriodControls
            key={statsSuspenseKey(range)}
            athleteId={selectedAthlete.id}
            params={listParams}
            rangeFrom={localDates.from}
            rangeTo={localDates.to}
          />
        </div>

        <div className="mt-6 space-y-4">
          <ActivitySummarySection>
            <Suspense key={statsSuspenseKey(range)} fallback={<ActivitySummarySkeleton />}>
              <ActivitySummary athleteId={selectedAthlete.id} range={range} timeZone={timeZone} />
            </Suspense>
          </ActivitySummarySection>

          {showHockeyStats ? (
            <HockeyStatsSection sportName={selectedAthlete.focusSport.name}>
              <Suspense key={statsSuspenseKey(range)} fallback={<HockeyStatsGridSkeleton />}>
                <HockeyStats
                  athleteId={selectedAthlete.id}
                  sportId={selectedAthlete.focusSportId}
                  range={range}
                />
              </Suspense>
            </HockeyStatsSection>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
