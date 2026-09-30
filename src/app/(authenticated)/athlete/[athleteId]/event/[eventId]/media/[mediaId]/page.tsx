import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { athleteEventHref, backToEventLabel } from "@/components/dashboard/dashboard-nav";
import { EventMediaPlayerSection } from "@/components/dashboard/event-media-player-section";
import { EventMediaPlayerSkeleton } from "@/components/dashboard/event-media-player-view";
import { getRequestLocale } from "@/lib/locale-server";

type AthleteEventMediaPageProps = {
  params: Promise<{ athleteId: string; eventId: string; mediaId: string }>;
};

export default async function AthleteEventMediaPage({ params }: AthleteEventMediaPageProps) {
  const { athleteId, eventId, mediaId } = await params;
  const normalizedAthleteId = athleteId.trim();
  const normalizedEventId = eventId.trim();
  const normalizedMediaId = mediaId.trim();

  if (!normalizedAthleteId || !normalizedEventId || !normalizedMediaId) {
    redirect("/dashboard");
  }

  const locale = await getRequestLocale();

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
      <Link
        href={athleteEventHref(normalizedAthleteId, normalizedEventId)}
        className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
      >
        {backToEventLabel(locale)}
      </Link>

      <div className="mt-4">
        <Suspense fallback={<EventMediaPlayerSkeleton />}>
          <EventMediaPlayerSection
            athleteId={normalizedAthleteId}
            eventId={normalizedEventId}
            mediaId={normalizedMediaId}
          />
        </Suspense>
      </div>
    </div>
  );
}
