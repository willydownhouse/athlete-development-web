import { getEventTone, type EventTone } from "@/lib/event-tone";
import type { Event, EventIntensity } from "@/lib/types";

export type WeekDayDisplay = {
  day: string;
  label: string;
  tone: Exclude<EventTone, "neutral">;
  height: number;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const TONE_BAR_LABEL: Record<Exclude<EventTone, "neutral">, string> = {
  ice: "Ice",
  recovery: "Rec",
  gym: "Gym",
  game: "Game",
  rest: "Rest",
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function intensityScore(intensity: EventIntensity | null): number {
  if (intensity === "hard") {
    return 3;
  }

  if (intensity === "moderate") {
    return 2;
  }

  if (intensity === "light") {
    return 1;
  }

  return 1.5;
}

function eventLoadScore(event: Event): number {
  let score = intensityScore(event.intensity);

  if (event.durationSeconds) {
    const minutes = event.durationSeconds / 60;
    if (minutes >= 90) {
      score += 1;
    } else if (minutes >= 45) {
      score += 0.5;
    }
  }

  return score;
}

function totalLoadScore(events: Event[]): number {
  return events.reduce((sum, event) => sum + eventLoadScore(event), 0);
}

function barHeightForDay(events: Event[]): number {
  if (events.length === 0) {
    return 28;
  }

  const score = totalLoadScore(events);

  if (score <= 2) {
    return 36;
  }

  if (score <= 4) {
    return 56;
  }

  if (score <= 6) {
    return 64;
  }

  return 88;
}

function displayTone(tone: EventTone): Exclude<EventTone, "neutral"> {
  return tone === "neutral" ? "rest" : tone;
}

function dominantToneForDay(events: Event[]): Exclude<EventTone, "neutral"> {
  if (events.length === 0) {
    return "rest";
  }

  const ranked = [...events].sort((a, b) => eventLoadScore(b) - eventLoadScore(a));
  const topEvent = ranked[0];

  if (!topEvent) {
    return "rest";
  }

  return displayTone(getEventTone(topEvent));
}

function eventsForDay(events: Event[], day: Date): Event[] {
  const key = localDateKey(day);
  return events.filter((event) => localDateKey(new Date(event.startedAt)) === key);
}

export function buildWeekDays(events: Event[], weekDays: Date[]): WeekDayDisplay[] {
  return weekDays.map((day, index) => {
    const dayEvents = eventsForDay(events, day);
    const tone = dominantToneForDay(dayEvents);
    return {
      day: WEEKDAY_LABELS[index] ?? "Day",
      label: dayEvents.length > 0 ? TONE_BAR_LABEL[tone] : "Rest",
      tone,
      height: barHeightForDay(dayEvents),
    };
  });
}

export function getWeekLoadLabel(events: Event[]): string {
  if (events.length === 0) {
    return "No load yet";
  }

  const score = totalLoadScore(events);

  if (score <= 4) {
    return "Light load";
  }

  if (score <= 10) {
    return "Moderate load";
  }

  return "Hard load";
}
