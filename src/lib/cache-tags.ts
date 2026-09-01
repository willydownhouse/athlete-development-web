export function athleteEventsCacheTag(athleteId: string): string {
  return `events-${athleteId}`;
}

export function eventCacheTag(eventId: string): string {
  return `event-${eventId}`;
}

export function chatMessagesCacheTag(threadId: string): string {
  return `chat-messages-${threadId}`;
}

export const EVENT_TYPES_CACHE_TAG = "event-types";
