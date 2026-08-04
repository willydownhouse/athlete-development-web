import { notFound } from "next/navigation";

import { EventDetailCard } from "@/components/dashboard/event-detail-card";
import { EventEditControls } from "@/components/dashboard/event-edit-controls";
import { fetchEventPageData, fetchEventPageFormData } from "@/lib/event-page-data";

type EventDetailSectionProps = {
  athleteId: string;
  eventId: string;
};

export async function EventDetailSection({ athleteId, eventId }: EventDetailSectionProps) {
  const [eventResult, formData] = await Promise.all([
    fetchEventPageData(athleteId, eventId),
    fetchEventPageFormData(),
  ]);

  if (eventResult.notFound) {
    notFound();
  }

  if (!eventResult.event) {
    return (
      <p className="rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
        {eventResult.error}
      </p>
    );
  }

  const event = eventResult.event;

  return (
    <EventDetailCard
      event={event}
      editAction={
        <EventEditControls
          athleteId={athleteId}
          event={event}
          eventTypes={formData.eventTypes}
          eventTypesError={formData.eventTypesError}
        />
      }
    />
  );
}
