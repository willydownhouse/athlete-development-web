import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { EventTobyDockSkeleton, EventTobySection } from "@/components/chat/event-toby-section";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EventDetailSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { EventDetailSection } from "@/components/dashboard/event-detail-section";
import { EventPageFrame } from "@/components/dashboard/event-page-frame";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

type AthleteEventPageProps = {
  params: Promise<{ athleteId: string; eventId: string }>;
};

export const maxDuration = 240;

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

  const [athletes, isAdmin] = await Promise.all([loadShellAthletes(token), getIsAdminUser()]);

  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <EventPageFrame
        dock={
          <Suspense fallback={<EventTobyDockSkeleton />}>
            <EventTobySection athleteId={normalizedAthleteId} eventId={normalizedEventId} />
          </Suspense>
        }
      >
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          {backToTodayLabel()}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Event</h1>

        <div className="mt-6">
          <Suspense fallback={<EventDetailSkeleton />}>
            <EventDetailSection
              athleteId={normalizedAthleteId}
              eventId={normalizedEventId}
              focusSportId={selectedAthlete.focusSportId}
              focusSportName={selectedAthlete.focusSport.name}
            />
          </Suspense>
        </div>
      </EventPageFrame>
    </DashboardShell>
  );
}
