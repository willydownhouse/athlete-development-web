import { compareCatalogNames, type AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
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
  locale: AppLocale,
): EventType[] {
  return eventTypes
    .filter((eventType) =>
      scope === "general" ? isGeneralEventType(eventType) : isSportEventType(eventType),
    )
    .sort((a, b) => compareCatalogNames(a.name, b.name, locale));
}

export function groupEventTypes(
  eventTypes: EventType[],
  focusSportName: string,
  locale: AppLocale,
): EventTypeGroup[] {
  const sportSpecific = filterEventTypesByScope(eventTypes, "sport", locale);
  const general = filterEventTypesByScope(eventTypes, "general", locale);
  const groups: EventTypeGroup[] = [];

  if (sportSpecific.length > 0) {
    groups.push({ label: focusSportName, items: sportSpecific });
  }

  if (general.length > 0) {
    groups.push({ label: getMessages(locale).common.general, items: general });
  }

  return groups;
}
