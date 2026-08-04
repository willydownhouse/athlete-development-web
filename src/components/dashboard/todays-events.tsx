import { fetchDashboardEventsInRange } from "@/lib/dashboard-event-data";

import { TodaysEventsCard } from "./todays-events-card";

type TodaysEventsProps = {
  athleteId: string;
  startedAtFrom: string;
  startedAtTo: string;
};

export async function TodaysEvents({ athleteId, startedAtFrom, startedAtTo }: TodaysEventsProps) {
  const result = await fetchDashboardEventsInRange(athleteId, startedAtFrom, startedAtTo);

  return <TodaysEventsCard athleteId={athleteId} events={result.events} loadError={result.error} />;
}
