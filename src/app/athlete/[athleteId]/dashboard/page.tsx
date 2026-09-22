import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { fetchAthletes, fetchEventTypes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";
import type { Athlete, EventType } from "@/lib/types";

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
  const locale = await getRequestLocale();

  const [athletesResult, eventTypesResult] = await Promise.all([
    token
      ? fetchAthletes(token, locale)
          .then((items) => ({ items, error: null }))
          .catch((error) => ({
            items: [] as Athlete[],
            error: error instanceof Error ? error.message : "Unable to load athletes",
          }))
      : Promise.resolve({
          items: [] as Athlete[],
          error: "Missing Auth.js session token",
        }),
    fetchEventTypes(locale)
      .then((items) => ({ items, error: null }))
      .catch((error) => ({
        items: [] as EventType[],
        error: error instanceof Error ? error.message : "Unable to load event types",
      })),
  ]);

  const selectedAthlete =
    athletesResult.items.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const eventTypes = eventTypesResult.items.filter(
    (eventType) => eventType.sportId === null || eventType.sportId === selectedAthlete.focusSportId,
  );

  return (
    <DashboardView
      userEmail={session.user.email ?? ""}
      athletes={athletesResult.items}
      selectedAthlete={selectedAthlete}
      eventTypes={eventTypes}
      eventTypesError={eventTypesResult.error}
      loadError={athletesResult.error}
    />
  );
}
