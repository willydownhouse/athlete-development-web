import { createChatThread } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestTimeZone } from "@/lib/time-zone-server";

import { EventTobyDock } from "./event-toby-dock";

type EventTobySectionProps = {
  athleteId: string;
  eventId: string;
};

export async function EventTobySection({ athleteId, eventId }: EventTobySectionProps) {
  const [token, timeZone] = await Promise.all([getAuthBearerToken(), getRequestTimeZone()]);
  const nowIso = new Date().toISOString();

  if (!token) {
    return (
      <EventTobyDock
        threadId={null}
        athleteId={athleteId}
        eventId={eventId}
        timeZone={timeZone}
        nowIso={nowIso}
        loadError="You need to sign in again"
      />
    );
  }

  let threadId: string | null = null;
  let loadError: string | null = null;

  try {
    const thread = await createChatThread(token);
    threadId = thread.id;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load chat";
  }

  return (
    <EventTobyDock
      threadId={threadId}
      athleteId={athleteId}
      eventId={eventId}
      timeZone={timeZone}
      nowIso={nowIso}
      loadError={loadError}
    />
  );
}

export function EventTobyDockSkeleton() {
  return (
    <div className="border-t border-white/5 bg-[#0b0d10] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-md lg:max-w-3xl">
        <div className="h-4 w-44 rounded bg-white/10" />
        <div className="mt-3 h-14 rounded-2xl bg-[#1c222c]" />
      </div>
    </div>
  );
}
