import { notFound } from "next/navigation";

import { EventDetailCard } from "@/components/dashboard/event-detail-card";
import { EventEditControls } from "@/components/dashboard/event-edit-controls";
import { fetchEventPageData, fetchEventPageFormData } from "@/lib/event-page-data";

type EventDetailSectionProps = {
  athleteId: string;
  eventId: string;
  focusSportId: string;
  focusSportName: string;
};

export async function EventDetailSection({
  athleteId,
  eventId,
  focusSportId,
  focusSportName,
}: EventDetailSectionProps) {
  const [eventResult, formData] = await Promise.all([
    fetchEventPageData(athleteId, eventId),
    fetchEventPageFormData(focusSportId),
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
          focusSportName={focusSportName}
          eventTypesError={formData.eventTypesError}
        />
      }
    />
  );
}
