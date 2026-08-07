import type {
  Athlete,
  AthleteAccessRole,
  AthleteListResponse,
  Event,
  EventIntensity,
  EventListResponse,
  EventType,
  EventTypeMetricDefinition,
  Sport,
  SportStats,
  UserRole,
} from "./types";
import { athleteEventsCacheTag, eventCacheTag } from "./cache-tags";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly apiError?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiBaseUrl(): string {
  return process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
}

async function parseApiError(response: Response): Promise<ApiError> {
  let apiError: string | undefined;

  try {
    const body = (await response.json()) as { error?: string };
    apiError = body.error;
  } catch {
    // ignore non-json error bodies
  }

  return new ApiError(
    apiError ?? `API request failed with status ${response.status}`,
    response.status,
    apiError,
  );
}

async function apiFetch<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
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
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchCurrentAppUser(token: string): Promise<AppUser> {
  return apiFetch<AppUser>(token, "/api/auth/me");
}

export async function fetchAthletes(token: string): Promise<Athlete[]> {
  const result = await apiFetch<AthleteListResponse>(token, "/api/athletes?limit=100");
  return result.items;
}

export async function createAthlete(
  token: string,
  body: {
    relationshipToAthlete: AthleteAccessRole;
    focusSportId: string;
    name: string;
    dateOfBirth?: string;
    heightCm?: number;
    weightKg?: number;
  },
): Promise<Athlete> {
  return apiFetch<Athlete>(token, "/api/athletes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchSports(): Promise<Sport[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/sports`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = (await response.json()) as { items: Sport[] };
  return result.items;
}

export async function createEvent(
  token: string,
  athleteId: string,
  body: {
    eventTypeId: string;
    startedAt: string;
    source: "chat" | "form" | "voice" | "manual";
    title?: string;
    description?: string;
    endedAt?: string;
    durationSeconds?: number;
    intensity?: EventIntensity;
    originalInput?: string;
    structuredData?: Record<string, unknown>;
    metrics?: EventMetricInput[];
  },
): Promise<Event> {
  return apiFetch<Event>(token, `/api/athletes/${athleteId}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type EventMetricInput = {
  metricDefinitionId: string;
  numericValue?: number;
  textValue?: string;
  booleanValue?: boolean;
  unit?: string;
};

export async function fetchEvents(
  token: string,
  athleteId: string,
  query: {
    limit?: number;
    offset?: number;
    startedAtFrom?: string;
    startedAtTo?: string;
    sportId?: string;
    include?: "metrics";
  } = {},
): Promise<EventListResponse> {
  const params = new URLSearchParams();

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.offset !== undefined) {
    params.set("offset", String(query.offset));
  }

  if (query.startedAtFrom) {
    params.set("startedAtFrom", query.startedAtFrom);
  }

  if (query.startedAtTo) {
    params.set("startedAtTo", query.startedAtTo);
  }

  if (query.sportId) {
    params.set("sportId", query.sportId);
  }

  if (query.include) {
    params.set("include", query.include);
  }

  const search = params.toString();

  const response = await fetch(
    `${getApiBaseUrl()}/api/athletes/${athleteId}/events${search ? `?${search}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "force-cache",
      next: {
        tags: [athleteEventsCacheTag(athleteId)],
      },
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = (await response.json()) as EventListResponse;
  return result;
}

export async function fetchEvent(
  token: string,
  athleteId: string,
  eventId: string,
  query: {
    include?: "metrics";
  } = {},
): Promise<Event> {
  const params = new URLSearchParams();

  if (query.include) {
    params.set("include", query.include);
  }

  const search = params.toString();

  const response = await fetch(
    `${getApiBaseUrl()}/api/athletes/${athleteId}/events/${eventId}${search ? `?${search}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "force-cache",
      next: {
        tags: [eventCacheTag(eventId), athleteEventsCacheTag(athleteId)],
      },
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<Event>;
}

export async function updateEvent(
  token: string,
  athleteId: string,
  eventId: string,
  body: {
    eventTypeId?: string;
    startedAt?: string;
    title?: string | null;
    description?: string | null;
    endedAt?: string;
    durationSeconds?: number | null;
    intensity?: EventIntensity | null;
    structuredData?: Record<string, unknown>;
    metrics?: EventMetricInput[];
  },
): Promise<Event> {
  return apiFetch<Event>(token, `/api/athletes/${athleteId}/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteEvent(
  token: string,
  athleteId: string,
  eventId: string,
): Promise<void> {
  return apiFetch<void>(token, `/api/athletes/${athleteId}/events/${eventId}`, {
    method: "DELETE",
  });
}

export async function fetchSportStats(
  token: string,
  athleteId: string,
  sportId: string,
  query: {
    startedAtFrom?: string;
    startedAtTo?: string;
  } = {},
): Promise<SportStats> {
  const params = new URLSearchParams();

  if (query.startedAtFrom) {
    params.set("startedAtFrom", query.startedAtFrom);
  }

  if (query.startedAtTo) {
    params.set("startedAtTo", query.startedAtTo);
  }

  const search = params.toString();

  const response = await fetch(
    `${getApiBaseUrl()}/api/athletes/${athleteId}/sports/${sportId}/stats${search ? `?${search}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "force-cache",
      next: {
        tags: [athleteEventsCacheTag(athleteId)],
      },
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as SportStats;
}

export async function fetchEventTypes(sportId?: string): Promise<EventType[]> {
  const query = sportId ? `?sportId=${encodeURIComponent(sportId)}` : "";
  const response = await fetch(`${getApiBaseUrl()}/api/event-types${query}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = (await response.json()) as { items: EventType[] };
  return result.items;
}

export async function fetchEventTypeMetricDefinitions(
  eventTypeId: string,
): Promise<EventTypeMetricDefinition[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/event-types/${encodeURIComponent(eventTypeId)}/metric-definitions`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = (await response.json()) as { items: EventTypeMetricDefinition[] };
  return result.items;
}
