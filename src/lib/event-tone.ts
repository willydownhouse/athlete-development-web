import type { Event, EventCategory } from "@/lib/types";

export type EventTone = "ice" | "recovery" | "gym" | "game" | "rest" | "neutral";

export const EVENT_TONE_BG_CLASS: Record<EventTone, string> = {
  ice: "bg-[#0ea5e9]",
  recovery: "bg-[#10b981]",
  gym: "bg-[#f59e0b]",
  game: "bg-[#f97316]",
  rest: "bg-[#a78bfa]",
  neutral: "bg-[#64748b]",
};

const EVENT_TONE_TEXT_CLASS: Record<EventTone, string> = {
  ice: "text-white",
  recovery: "text-white",
  gym: "text-[#1a1207]",
  game: "text-white",
  rest: "text-white",
  neutral: "text-white",
};

const EVENT_TYPE_SLUG_TONE: Record<string, EventTone> = {
  ice_practice: "ice",
  team_practice: "ice",
  individual_practice: "ice",
  skating: "ice",
  stickhandling: "ice",
  skill_training: "ice",
  shooting: "ice",
  gym: "gym",
  off_ice: "gym",
  mobility: "recovery",
  recovery: "recovery",
  sleep: "recovery",
  rest: "rest",
  game: "game",
  tournament: "game",
};

const CATEGORY_TONE: Partial<Record<EventCategory, EventTone>> = {
  competition: "game",
  recovery: "recovery",
  training: "gym",
};

export function getEventTone(event: Pick<Event, "category" | "sportId" | "eventType">): EventTone {
  const slugTone = EVENT_TYPE_SLUG_TONE[event.eventType.slug];
  if (slugTone) {
    return slugTone;
  }

  if (event.category === "training" && event.sportId) {
    return "ice";
  }

  return CATEGORY_TONE[event.category] ?? "neutral";
}

export function eventIconClassName(
  event: Pick<Event, "category" | "sportId" | "eventType">,
): string {
  const tone = getEventTone(event);
  return `${EVENT_TONE_BG_CLASS[tone]} ${EVENT_TONE_TEXT_CLASS[tone]}`;
}
