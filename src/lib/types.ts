export type UserRole = "owner" | "athlete" | "coach" | "admin";

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
