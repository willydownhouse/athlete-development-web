import type { EventType } from "@/lib/types";

export type EventTypeScope = "general" | "sport";

export type EventTypeGroup = {
  label: string;
  items: EventType[];
};

function isGeneralEventType(eventType: EventType): boolean {
  return eventType.sportId === null;
}

function isSportEventType(eventType: EventType): boolean {
  return eventType.sportId !== null;
}

export function filterEventTypesByScope(
  eventTypes: EventType[],
  scope: EventTypeScope,
): EventType[] {
  return eventTypes
    .filter((eventType) =>
      scope === "general" ? isGeneralEventType(eventType) : isSportEventType(eventType),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function groupEventTypes(eventTypes: EventType[], focusSportName: string): EventTypeGroup[] {
  const sportSpecific = filterEventTypesByScope(eventTypes, "sport");
  const general = filterEventTypesByScope(eventTypes, "general");
  const groups: EventTypeGroup[] = [];

  if (sportSpecific.length > 0) {
    groups.push({ label: focusSportName, items: sportSpecific });
  }

  if (general.length > 0) {
    groups.push({ label: "General", items: general });
  }

  return groups;
}
