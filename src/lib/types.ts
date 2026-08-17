export type UserRole = "user" | "maintainer" | "admin";

export type AthleteAccessRole = "parent" | "athlete";

type AthleteProfile = {
  id: string;
  athleteId: string;
  createdAt: string;
  updatedAt: string;
};

export type Athlete = {
  id: string;
  focusSportId: string;
  name: string;
  dateOfBirth: string | null;
  createdAt: string;
  deletedAt: string | null;
  focusSport: Sport;
  profile: AthleteProfile | null;
};

export type AthleteListResponse = {
  items: Athlete[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type EventCategory =
  | "training"
  | "competition"
  | "recovery"
  | "health"
  | "nutrition"
  | "mood"
  | "measurement"
  | "note"
  | "travel"
  | "equipment"
  | "other";

export type MetricValueType = "number" | "text" | "boolean";

export type Sport = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventType = {
  id: string;
  sportId: string | null;
  category: EventCategory;
  slug: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sport: Sport | null;
};

export type EventIntensity = "light" | "moderate" | "hard";

export type EventMetric = {
  id: string;
  eventId: string;
  metricDefinitionId: string;
  numericValue: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
  metricDefinition: MetricDefinition;
};

export type Event = {
  id: string;
  athleteId: string;
  eventTypeId: string;
  createdByUserId: string;
  sportId: string | null;
  category: EventCategory;
  title: string | null;
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  intensity: EventIntensity | null;
  source: "chat" | "form" | "voice" | "manual";
  originalInput: string | null;
  structuredData: unknown | null;
  createdAt: string;
  updatedAt: string;
  eventType: EventType;
  metrics?: EventMetric[];
};

export type EventListResponse = {
  items: Event[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

type SportStatsEventTypeStats = {
  name: string;
  durationSeconds: number;
  metrics?: Record<string, SportStatsMetricStats>;
};

type SportStatsMetricStats = {
  name: string;
  canonicalUnit: string | null;
  total: number;
  eventCount?: number;
};

export type SportStats = {
  athleteId: string;
  sportId: string;
  eventTypes: Record<string, SportStatsEventTypeStats>;
};

export type MetricDefinition = {
  id: string;
  sportId: string | null;
  key: string;
  name: string;
  description: string | null;
  valueType: MetricValueType;
  canonicalUnit: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sport: Sport | null;
};

export type EventTypeMetricDefinition = {
  id: string;
  eventTypeId: string;
  metricDefinitionId: string;
  required: boolean;
  sortOrder: number;
  metricDefinition: MetricDefinition;
};

export const EVENT_CATEGORIES: EventCategory[] = [
  "training",
  "competition",
  "recovery",
  "health",
  "nutrition",
  "mood",
  "measurement",
  "note",
  "travel",
  "equipment",
  "other",
];

export const METRIC_VALUE_TYPES: MetricValueType[] = ["number", "text", "boolean"];

export function formatCategoryLabel(category: EventCategory): string {
  return category.replace(/_/g, " ");
}
