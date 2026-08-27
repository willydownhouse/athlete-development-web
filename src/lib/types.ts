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

export type EventItemMetric = {
  id: string;
  eventItemId: string;
  metricDefinitionId: string;
  numericValue: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
  metricDefinition: MetricDefinition;
};

export type EventItem = {
  id: string;
  eventId: string;
  eventItemTypeId: string;
  parentEventItemId: string | null;
  sortOrder: number;
  label: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  notes: string | null;
  structuredData: unknown | null;
  createdAt: string;
  updatedAt: string;
  eventItemType: EventItemType;
  metrics: EventItemMetric[];
  children: EventItem[];
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
  items?: EventItem[];
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

export type EventItemType = {
  id: string;
  sportId: string | null;
  slug: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sport: Sport | null;
};

export type EventTypeItemType = {
  id: string;
  eventTypeId: string;
  eventItemTypeId: string;
  required: boolean;
  sortOrder: number;
  eventItemType: EventItemType;
};

export type EventItemTypeChildType = {
  id: string;
  parentEventItemTypeId: string;
  childEventItemTypeId: string;
  sortOrder: number;
  childEventItemType: EventItemType;
};

export type EventItemTypeMetricDefinition = {
  id: string;
  eventItemTypeId: string;
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

export type MediaKind = "image" | "video";

export type MediaStatus = "uploading" | "queued" | "processing" | "ready" | "failed";

export type EventMediaItem = {
  id: string;
  kind: MediaKind;
  status: MediaStatus;
  originalFilename: string | null;
  width: number | null;
  height: number | null;
  originalWidth: number | null;
  originalHeight: number | null;
  durationSeconds: number | null;
  failureCode: string | null;
  updatedAt: string;
};

export type EventMediaReadAssets = {
  readUrl: string;
  readExpiresAt: string;
  posterUrl: string | null;
  posterExpiresAt: string | null;
};

export type EventMediaListResponse = {
  items: EventMediaItem[];
};

export type MediaUploadIntentResponse = {
  id: string;
  eventId: string;
  kind: MediaKind;
  status: MediaStatus;
  declaredMimeType: string;
  declaredByteSize: number;
  originalFilename: string | null;
  uploadUrl: string;
  uploadExpiresAt: string;
  createdAt: string;
};

export type MediaReadUrlResponse = {
  id: string;
  readUrl: string;
  readExpiresAt: string;
  posterUrl: string | null;
  posterExpiresAt: string | null;
};

export function formatCategoryLabel(category: EventCategory): string {
  return category.replace(/_/g, " ");
}
