import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShellAdminNavLink } from "@/components/app-shell-admin-nav-link";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EventDetailSection } from "@/components/dashboard/event-detail-section";
import { EventDetailSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellAthletes, loadShellOnboardingSessions } from "@/lib/shell-data";

type AthleteEventPageProps = {
  params: Promise<{ athleteId: string; eventId: string }>;
};

export default async function AthleteEventPage({ params }: AthleteEventPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId, eventId } = await params;
  const normalizedAthleteId = athleteId.trim();
  const normalizedEventId = eventId.trim();

  if (!normalizedAthleteId || !normalizedEventId) {
    redirect("/dashboard");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [onboardingSessions, athletes] = await Promise.all([
    loadShellOnboardingSessions(token),
    loadShellAthletes(token),
  ]);

  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      adminNavLink={<AppShellAdminNavLink />}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      onboardingSessions={onboardingSessions}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-28 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Event</h1>

        <div className="mt-6">
          <Suspense fallback={<EventDetailSkeleton />}>
            <EventDetailSection athleteId={normalizedAthleteId} eventId={normalizedEventId} />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  );
}
