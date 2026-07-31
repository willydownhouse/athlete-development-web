import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { fetchAthletes, fetchCurrentAppUser, fetchEventTypes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellOnboardingSessions } from "@/lib/shell-data";
import type { EventType } from "@/lib/types";

type DashboardPageProps = {
  searchParams: Promise<{ athleteId?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await searchParams;
  const token = await getAuthBearerToken();
  const onboardingSessions = await loadShellOnboardingSessions(token);

  let athletes = [] as Awaited<ReturnType<typeof fetchAthletes>>;
  let isAdmin = false;
  let loadError: string | null = null;

  if (token) {
    const [athletesResult, appUserResult] = await Promise.allSettled([
      fetchAthletes(token),
      fetchCurrentAppUser(token),
    ]);

    if (athletesResult.status === "fulfilled") {
      athletes = athletesResult.value;
    } else {
      loadError =
        athletesResult.reason instanceof Error
          ? athletesResult.reason.message
          : "Unable to load athletes";
    }

    if (appUserResult.status === "fulfilled") {
      isAdmin = appUserResult.value.role === "admin";
    }
  } else {
    loadError = "Missing Auth.js session token";
  }

  if (athletes.length > 0) {
    const normalizedAthleteId = athleteId?.trim() ?? "";
    const selectedFromUrl = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

    if (!normalizedAthleteId || !selectedFromUrl) {
      const firstAthlete = athletes[0];
      if (firstAthlete) {
        redirect(dashboardHref(firstAthlete.id));
      }
    }
  }

  const selectedAthlete =
    athleteId && athletes.length > 0
      ? (athletes.find((athlete) => athlete.id === athleteId) ?? null)
      : null;

  let eventTypes: EventType[] = [];
  let eventTypesError: string | null = null;

  try {
    // Fetch the full active catalog so Quick Log can split General vs Hockey.
    eventTypes = await fetchEventTypes();
  } catch (error) {
    eventTypesError = error instanceof Error ? error.message : "Unable to load event types";
  }

  return (
    <DashboardView
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      eventTypes={eventTypes}
      eventTypesError={eventTypesError}
      loadError={loadError}
      onboardingSessions={onboardingSessions}
    />
  );
}
