import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HockeyStats } from "@/components/dashboard/hockey-stats";
import { HockeyStatsSection } from "@/components/dashboard/hockey-stats-section";
import { HockeyStatsGridSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import { parseHockeyStatsPeriod } from "@/lib/hockey-stats/period";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestTimeZone } from "@/lib/time-zone-server";

type AthleteStatsPageProps = {
  params: Promise<{ athleteId: string }>;
  searchParams: Promise<{ statsPeriod?: string }>;
};

export default async function AthleteStatsPage({ params, searchParams }: AthleteStatsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await params;
  const { statsPeriod } = await searchParams;
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

  if (selectedAthlete.focusSport.slug !== HOCKEY_SPORT_SLUG) {
    redirect(dashboardHref(selectedAthlete.id));
  }

  const period = parseHockeyStatsPeriod(statsPeriod);

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

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Stats</h1>

        <div className="mt-6">
          <HockeyStatsSection athleteId={selectedAthlete.id} period={period}>
            <Suspense key={period} fallback={<HockeyStatsGridSkeleton />}>
              <HockeyStats
                athleteId={selectedAthlete.id}
                sportId={selectedAthlete.focusSportId}
                period={period}
                timeZone={timeZone}
              />
            </Suspense>
          </HockeyStatsSection>
        </div>
      </div>
    </DashboardShell>
  );
}
