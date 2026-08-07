import { EventsListContent } from "@/components/dashboard/events-list-content";
import { fetchAthleteEventsList } from "@/lib/events-list-data";
import type { EventsListSearchParams } from "@/lib/events-list-params";

type EventsListSectionProps = {
  athleteId: string;
  params: EventsListSearchParams;
};

export async function EventsListSection({ athleteId, params }: EventsListSectionProps) {
  const result = await fetchAthleteEventsList(athleteId, params);

  if (result.error || !result.data) {
    return (
      <p className="rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
        {result.error}
      </p>
    );
  }

  return (
    <EventsListContent
      athleteId={athleteId}
      params={params}
      events={result.data.items}
      total={result.data.pagination.total}
    />
  );
}
