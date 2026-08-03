import { getApiBaseUrl } from "./api";
import type {
  EventType,
  EventTypeMetricDefinition,
  MetricDefinition,
  OnboardingQuestion,
  Sport,
} from "./types";

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly apiError?: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type ListResponse<T> = { items: T[] };

async function adminFetch<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let apiError: string | undefined;

    try {
      const body = (await response.json()) as { error?: string };
      apiError = body.error;
    } catch {
      // ignore non-json error bodies
    }

    throw new AdminApiError(
      apiError ?? `API request failed with status ${response.status}`,
      response.status,
      apiError,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

// Sports

export async function listAdminSports(token: string, active?: boolean): Promise<Sport[]> {
  const result = await adminFetch<ListResponse<Sport>>(
    token,
    `/api/admin/sports${buildQuery({ active: active === undefined ? undefined : String(active) })}`,
  );
  return result.items;
}

export async function createAdminSport(
  token: string,
  body: { slug: string; name: string; active?: boolean },
): Promise<Sport> {
  return adminFetch<Sport>(token, "/api/admin/sports", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminSport(
  token: string,
  sportId: string,
  body: Partial<{ slug: string; name: string; active: boolean }>,
): Promise<Sport> {
  return adminFetch<Sport>(token, `/api/admin/sports/${sportId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Event types

export async function listAdminEventTypes(
  token: string,
  query: { sportId?: string; category?: string; active?: boolean } = {},
): Promise<EventType[]> {
  const result = await adminFetch<ListResponse<EventType>>(
    token,
    `/api/admin/event-types${buildQuery({
      sportId: query.sportId,
      category: query.category,
      active: query.active === undefined ? undefined : String(query.active),
    })}`,
  );
  return result.items;
}

export async function getAdminEventType(token: string, eventTypeId: string): Promise<EventType> {
  return adminFetch<EventType>(token, `/api/admin/event-types/${eventTypeId}`);
}

export async function createAdminEventType(
  token: string,
  body: {
    sportId?: string | null;
    category: string;
    slug: string;
    name: string;
    active?: boolean;
  },
): Promise<EventType> {
  return adminFetch<EventType>(token, "/api/admin/event-types", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminEventType(
  token: string,
  eventTypeId: string,
  body: Partial<{
    sportId: string | null;
    category: string;
    slug: string;
    name: string;
    active: boolean;
  }>,
): Promise<EventType> {
  return adminFetch<EventType>(token, `/api/admin/event-types/${eventTypeId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Metric definitions

export async function listAdminMetricDefinitions(
  token: string,
  query: { sportId?: string; active?: boolean } = {},
): Promise<MetricDefinition[]> {
  const result = await adminFetch<ListResponse<MetricDefinition>>(
    token,
    `/api/admin/metric-definitions${buildQuery({
      sportId: query.sportId,
      active: query.active === undefined ? undefined : String(query.active),
    })}`,
  );
  return result.items;
}

export async function createAdminMetricDefinition(
  token: string,
  body: {
    sportId?: string | null;
    key: string;
    name: string;
    description?: string;
    valueType: string;
    canonicalUnit?: string;
    active?: boolean;
  },
): Promise<MetricDefinition> {
  return adminFetch<MetricDefinition>(token, "/api/admin/metric-definitions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminMetricDefinition(
  token: string,
  metricDefinitionId: string,
  body: Partial<{
    sportId: string | null;
    key: string;
    name: string;
    description: string | null;
    valueType: string;
    canonicalUnit: string | null;
    active: boolean;
  }>,
): Promise<MetricDefinition> {
  return adminFetch<MetricDefinition>(
    token,
    `/api/admin/metric-definitions/${metricDefinitionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

// Event type metric definitions

export async function listAdminEventTypeMetricDefinitions(
  token: string,
  eventTypeId: string,
): Promise<EventTypeMetricDefinition[]> {
  const result = await adminFetch<ListResponse<EventTypeMetricDefinition>>(
    token,
    `/api/admin/event-types/${eventTypeId}/metric-definitions`,
  );
  return result.items;
}

export async function createAdminEventTypeMetricDefinition(
  token: string,
  eventTypeId: string,
  body: { metricDefinitionId: string; required?: boolean; sortOrder?: number },
): Promise<EventTypeMetricDefinition> {
  return adminFetch<EventTypeMetricDefinition>(
    token,
    `/api/admin/event-types/${eventTypeId}/metric-definitions`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateAdminEventTypeMetricDefinition(
  token: string,
  eventTypeId: string,
  eventTypeMetricDefinitionId: string,
  body: Partial<{ required: boolean; sortOrder: number }>,
): Promise<EventTypeMetricDefinition> {
  return adminFetch<EventTypeMetricDefinition>(
    token,
    `/api/admin/event-types/${eventTypeId}/metric-definitions/${eventTypeMetricDefinitionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteAdminEventTypeMetricDefinition(
  token: string,
  eventTypeId: string,
  eventTypeMetricDefinitionId: string,
): Promise<void> {
  await adminFetch<void>(
    token,
    `/api/admin/event-types/${eventTypeId}/metric-definitions/${eventTypeMetricDefinitionId}`,
    { method: "DELETE" },
  );
}

// Onboarding questions

export async function listAdminOnboardingQuestions(
  token: string,
  query: { sportId?: string; active?: boolean } = {},
): Promise<OnboardingQuestion[]> {
  const result = await adminFetch<ListResponse<OnboardingQuestion>>(
    token,
    `/api/admin/onboarding-questions${buildQuery({
      sportId: query.sportId,
      active: query.active === undefined ? undefined : String(query.active),
    })}`,
  );
  return result.items;
}

export async function getAdminOnboardingQuestion(
  token: string,
  onboardingQuestionId: string,
): Promise<OnboardingQuestion> {
  return adminFetch<OnboardingQuestion>(
    token,
    `/api/admin/onboarding-questions/${onboardingQuestionId}`,
  );
}

export async function createAdminOnboardingQuestion(
  token: string,
  body: {
    sportId?: string | null;
    key: string;
    prompt: string;
    helpText?: string;
    sortOrder?: number;
    answerType: string;
    options?: unknown;
    mapsToField?: string;
    required?: boolean;
    active?: boolean;
  },
): Promise<OnboardingQuestion> {
  return adminFetch<OnboardingQuestion>(token, "/api/admin/onboarding-questions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminOnboardingQuestion(
  token: string,
  onboardingQuestionId: string,
  body: Partial<{
    sportId: string | null;
    key: string;
    prompt: string;
    helpText: string | null;
    sortOrder: number;
    answerType: string;
    options: unknown | null;
    mapsToField: string | null;
    required: boolean;
    active: boolean;
  }>,
): Promise<OnboardingQuestion> {
  return adminFetch<OnboardingQuestion>(
    token,
    `/api/admin/onboarding-questions/${onboardingQuestionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
