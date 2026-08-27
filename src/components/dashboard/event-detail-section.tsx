import { notFound } from "next/navigation";

import { EventDetailActionsLayout } from "@/components/dashboard/event-card-actions";
import { fetchEventPageData, fetchEventPageFormData } from "@/lib/event-page-data";
import { getRequestTimeZone } from "@/lib/time-zone-server";

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
  const [eventResult, formData, timeZone] = await Promise.all([
    fetchEventPageData(athleteId, eventId),
    fetchEventPageFormData(focusSportId),
    getRequestTimeZone(),
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
    <EventDetailActionsLayout
      athleteId={athleteId}
      event={event}
      timeZone={timeZone}
      eventTypes={formData.eventTypes}
      focusSportName={focusSportName}
      eventTypesError={formData.eventTypesError}
    />
  );
}
