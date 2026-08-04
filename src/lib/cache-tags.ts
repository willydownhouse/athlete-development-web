export function athleteEventsCacheTag(athleteId: string): string {
  return `events-${athleteId}`;
}

export function eventCacheTag(eventId: string): string {
  return `event-${eventId}`;
}
