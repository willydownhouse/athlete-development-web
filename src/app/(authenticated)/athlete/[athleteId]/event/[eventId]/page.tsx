import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { EventTobyDockSkeleton, EventTobySection } from "@/components/chat/event-toby-section";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { EventDetailSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { EventDetailSection } from "@/components/dashboard/event-detail-section";
import { EventPageFrame } from "@/components/dashboard/event-page-frame";
import { loadAccessibleAthlete } from "@/lib/accessible-athlete";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

type AthleteEventPageProps = {
  params: Promise<{ athleteId: string; eventId: string }>;
};

export const maxDuration = 240;

export default async function AthleteEventPage({ params }: AthleteEventPageProps) {
  const { athleteId, eventId } = await params;
  const normalizedEventId = eventId.trim();

  if (!normalizedEventId) {
    redirect("/dashboard");
  }

  const [selectedAthlete, locale] = await Promise.all([
    loadAccessibleAthlete(athleteId),
    getRequestLocale(),
  ]);
  const messages = getMessages(locale);

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  return (
    <EventPageFrame
      dock={
        <Suspense fallback={<EventTobyDockSkeleton />}>
          <EventTobySection athleteId={selectedAthlete.id} eventId={normalizedEventId} />
        </Suspense>
      }
    >
      <Link
        href={dashboardHref(selectedAthlete.id)}
        className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
      >
        {backToTodayLabel(locale)}
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-white max-lg:sr-only lg:mt-4">
        {messages.nav.event}
      </h1>

      <div className="mt-6">
        <Suspense fallback={<EventDetailSkeleton />}>
          <EventDetailSection
            athleteId={selectedAthlete.id}
            eventId={normalizedEventId}
            focusSportId={selectedAthlete.focusSportId}
            focusSportName={selectedAthlete.focusSport.name}
          />
        </Suspense>
      </div>
    </EventPageFrame>
  );
}
