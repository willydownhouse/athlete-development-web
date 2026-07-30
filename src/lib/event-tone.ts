import type { Event, EventCategory } from "@/lib/types";

export type EventTone = "ice" | "recovery" | "gym" | "game" | "rest" | "neutral";

export const EVENT_TONE_BG_CLASS: Record<EventTone, string> = {
  ice: "bg-[#5f7388]",
  recovery: "bg-[#6f8f6a]",
  gym: "bg-[#9a7f5f]",
  game: "bg-[#9a7f5f]",
  rest: "bg-[#6f8f6a]",
  neutral: "bg-[#2a303a]",
};

const EVENT_TONE_TEXT_CLASS: Record<EventTone, string> = {
  ice: "text-white/90",
  recovery: "text-white/90",
  gym: "text-white/90",
  game: "text-white/90",
  rest: "text-white/90",
  neutral: "text-zinc-200",
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
