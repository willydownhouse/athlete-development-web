import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { loadAccessibleAthlete } from "@/lib/accessible-athlete";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { fetchEventTypes } from "@/lib/api";
import { getRequestLocale } from "@/lib/locale-server";
import type { EventType } from "@/lib/types";

type AthleteDashboardPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteDashboardPage({ params }: AthleteDashboardPageProps) {
  const { athleteId } = await params;
  const [selectedAthlete, locale, actions] = await Promise.all([
    loadAccessibleAthlete(athleteId),
    getRequestLocale(),
    getActionMessages(),
  ]);

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const eventTypesResult = await fetchEventTypes(locale)
    .then((items) => ({ items, error: null }))
    .catch((error) => ({
      items: [] as EventType[],
      error: passthroughOrGeneric(error, actions.loadEventTypes),
    }));

  const eventTypes = eventTypesResult.items.filter(
    (eventType) => eventType.sportId === null || eventType.sportId === selectedAthlete.focusSportId,
  );

  return (
    <DashboardView
      selectedAthlete={selectedAthlete}
      eventTypes={eventTypes}
      eventTypesError={eventTypesResult.error}
    />
  );
}
