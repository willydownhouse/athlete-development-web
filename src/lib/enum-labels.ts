import type { AppLocale } from "@/lib/locale";
import type { EventCategory, EventIntensity } from "@/lib/types";

const EVENT_CATEGORY_LABELS = {
  en: {
    training: "Training",
    competition: "Competition",
    recovery: "Recovery",
    health: "Health",
    nutrition: "Nutrition",
    mood: "Mood",
    measurement: "Measurement",
    note: "Note",
    travel: "Travel",
    equipment: "Equipment",
    other: "Other",
  },
  fi: {
    training: "Harjoittelu",
    competition: "Kilpailu",
    recovery: "Palautuminen",
    health: "Terveys",
    nutrition: "Ravinto",
    mood: "Mieliala",
    measurement: "Mittaus",
    note: "Muistiinpano",
    travel: "Matka",
    equipment: "Varusteet",
    other: "Muu",
  },
} as const satisfies Record<AppLocale, Record<EventCategory, string>>;

const EVENT_INTENSITY_LABELS = {
  en: {
    light: "Light",
    moderate: "Moderate",
    hard: "Hard",
  },
  fi: {
    light: "Kevyt",
    moderate: "Kohtalainen",
    hard: "Kova",
  },
} as const satisfies Record<AppLocale, Record<EventIntensity, string>>;

export function formatEventCategoryLabel(category: EventCategory, locale: AppLocale): string {
  return EVENT_CATEGORY_LABELS[locale][category];
}

export function formatEventIntensityLabel(intensity: EventIntensity, locale: AppLocale): string {
  return EVENT_INTENSITY_LABELS[locale][intensity];
}
