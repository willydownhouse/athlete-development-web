import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { fetchAthletes, fetchEventTypes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellOnboardingSessions } from "@/lib/shell-data";
import type { EventType } from "@/lib/types";

type AthleteDashboardPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteDashboardPage({ params }: AthleteDashboardPageProps) {
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
  const onboardingSessions = await loadShellOnboardingSessions(token);

  let athletes = [] as Awaited<ReturnType<typeof fetchAthletes>>;
  let loadError: string | null = null;

  if (token) {
    try {
      athletes = await fetchAthletes(token);
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Unable to load athletes";
    }
  } else {
    loadError = "Missing Auth.js session token";
  }

  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

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
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      eventTypes={eventTypes}
      eventTypesError={eventTypesError}
      loadError={loadError}
      onboardingSessions={onboardingSessions}
    />
  );
}
