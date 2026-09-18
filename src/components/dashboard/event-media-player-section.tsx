import { notFound, redirect } from "next/navigation";

import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventMediaPlayerView } from "@/components/dashboard/event-media-player-view";
import { fetchEventMediaPlayerPageData } from "@/lib/event-media-page-data";

type EventMediaPlayerSectionProps = {
  athleteId: string;
  eventId: string;
  mediaId: string;
};

export async function EventMediaPlayerSection({
  athleteId,
  eventId,
  mediaId,
}: EventMediaPlayerSectionProps) {
  const result = await fetchEventMediaPlayerPageData(athleteId, eventId, mediaId);

  if ("notFound" in result) {
    notFound();
  }

  if ("redirectToEvent" in result) {
    redirect(athleteEventHref(athleteId, eventId));
  }

  if ("error" in result) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Video</h1>
        <p className="mt-6 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
          {result.error}
        </p>
      </>
    );
  }

  return (
    <EventMediaPlayerView
      athleteId={athleteId}
      eventId={eventId}
      item={result.item}
      assets={result.assets}
    />
  );
}
