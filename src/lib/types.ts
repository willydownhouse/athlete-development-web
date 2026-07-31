export type UserRole = "owner" | "athlete" | "coach" | "admin";

type AthleteProfile = {
  id: string;
  athleteId: string;
  teamName: string | null;
  level: string | null;
  strengths: unknown | null;
  developmentAreas: unknown | null;
  trainingEnvironment: unknown | null;
  injuryNotes: string | null;
  motivationNotes: string | null;
  parentObservations: string | null;
  sportSpecificData: unknown | null;
  aiProfileSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Athlete = {
  id: string;
  ownerUserId: string;
  focusSportId: string;
  name: string;
  dateOfBirth: string | null;
  heightCm: number | null;
  weightKg: number | null;
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

export type OnboardingAnswerType =
  "text" | "number" | "boolean" | "single_select" | "multi_select" | "date" | "json";

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

export type OnboardingQuestion = {
  id: string;
  sportId: string | null;
  key: string;
  prompt: string;
  helpText: string | null;
  sortOrder: number;
  answerType: OnboardingAnswerType;
  options: unknown | null;
  mapsToField: string | null;
  required: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sport: Sport | null;
};

export type OnboardingAnswer = {
  id: string;
  sessionId: string;
  athleteId: string;
  sportId: string;
  questionId: string;
  questionKey: string;
  promptSnapshot: string;
  rawAnswer: string;
  structuredValue: unknown | null;
  answeredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingSession = {
  id: string;
  athleteId: string;
  sportId: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sport: Sport;
  answers?: OnboardingAnswer[];
};

export type OnboardingSessionSummary = Omit<OnboardingSession, "answers"> & {
  athlete: {
    id: string;
    name: string;
  };
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

export const ONBOARDING_ANSWER_TYPES: OnboardingAnswerType[] = [
  "text",
  "number",
  "boolean",
  "single_select",
  "multi_select",
  "date",
  "json",
];
