import messages from "../../messages/en.json";
import { getEventTone, type EventTone } from "@/lib/event-tone";
import { eventsForLocalDate } from "@/lib/event-grouping";
import type { Event, EventIntensity } from "@/lib/types";

export type WeekDayDisplay = {
  day: string;
  label: string;
  tone: Exclude<EventTone, "neutral">;
  height: number;
  date: Date;
};

export type WeekSummaryLabels = {
  weekdays: readonly string[];
  toneLabels: Record<Exclude<EventTone, "neutral">, string>;
  loadLabels: {
    none: string;
    light: string;
    moderate: string;
    hard: string;
  };
};

function getDefaultWeekSummaryLabels(): WeekSummaryLabels {
  const source = messages.dashboard.thisWeek;

  return {
    weekdays: [
      source.weekdays.mon,
      source.weekdays.tue,
      source.weekdays.wed,
      source.weekdays.thu,
      source.weekdays.fri,
      source.weekdays.sat,
      source.weekdays.sun,
    ],
    toneLabels: {
      ice: source.toneLabels.ice,
      recovery: source.toneLabels.recovery,
      gym: source.toneLabels.gym,
      game: source.toneLabels.game,
      rest: source.toneLabels.rest,
    },
    loadLabels: {
      none: source.loadNone,
      light: source.loadLight,
      moderate: source.loadModerate,
      hard: source.loadHard,
    },
  };
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

export function buildWeekDays(
  events: Event[],
  weekDays: Date[],
  labels: WeekSummaryLabels = getDefaultWeekSummaryLabels(),
): WeekDayDisplay[] {
  return weekDays.map((day, index) => {
    const dayEvents = eventsForLocalDate(events, day);
    const tone = dominantToneForDay(dayEvents);
    return {
      day: labels.weekdays[index] ?? "Day",
      label: dayEvents.length > 0 ? labels.toneLabels[tone] : labels.toneLabels.rest,
      tone,
      height: barHeightForDay(dayEvents),
      date: day,
    };
  });
}

export function getWeekLoadLabel(
  events: Event[],
  labels: WeekSummaryLabels = getDefaultWeekSummaryLabels(),
): string {
  if (events.length === 0) {
    return labels.loadLabels.none;
  }

  const score = totalLoadScore(events);

  if (score <= 4) {
    return labels.loadLabels.light;
  }

  if (score <= 10) {
    return labels.loadLabels.moderate;
  }

  return labels.loadLabels.hard;
}
