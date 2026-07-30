import type {
  Athlete,
  AthleteListResponse,
  Event,
  EventIntensity,
  EventListResponse,
  EventType,
  OnboardingAnswer,
  OnboardingQuestion,
  OnboardingSession,
  OnboardingSessionSummary,
  Sport,
  UserRole,
} from "./types";

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
  },
): Promise<Event> {
  return apiFetch<Event>(token, `/api/athletes/${athleteId}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchEvents(
  token: string,
  athleteId: string,
  query: {
    limit?: number;
    offset?: number;
    startedAtFrom?: string;
    startedAtTo?: string;
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

  const search = params.toString();

  return apiFetch<EventListResponse>(
    token,
    `/api/athletes/${athleteId}/events${search ? `?${search}` : ""}`,
    {
      next: {
        tags: [`events-${athleteId}`],
      },
    },
  );
}

export async function updateEvent(
  token: string,
  athleteId: string,
  eventId: string,
  body: {
    eventTypeId?: string;
    startedAt?: string;
    title?: string;
    description?: string;
    endedAt?: string;
    durationSeconds?: number;
    intensity?: EventIntensity;
    structuredData?: Record<string, unknown>;
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

export async function fetchOnboardingQuestions(
  token: string,
  sportId: string,
): Promise<OnboardingQuestion[]> {
  const result = await apiFetch<{ items: OnboardingQuestion[] }>(
    token,
    `/api/onboarding/questions?sportId=${encodeURIComponent(sportId)}`,
  );
  return result.items;
}

export async function fetchOnboardingSessions(token: string): Promise<OnboardingSessionSummary[]> {
  const result = await apiFetch<{ items: OnboardingSessionSummary[] }>(
    token,
    "/api/onboarding/sessions",
  );
  return result.items;
}

export async function startOnboardingSession(
  token: string,
  athleteId: string,
): Promise<OnboardingSession> {
  return apiFetch<OnboardingSession>(token, `/api/athletes/${athleteId}/onboarding-sessions`, {
    method: "POST",
  });
}

export async function getOnboardingSession(
  token: string,
  athleteId: string,
  sessionId: string,
): Promise<OnboardingSession> {
  return apiFetch<OnboardingSession>(
    token,
    `/api/athletes/${athleteId}/onboarding-sessions/${sessionId}`,
  );
}

export async function upsertOnboardingAnswer(
  token: string,
  athleteId: string,
  sessionId: string,
  body: {
    questionId: string;
    rawAnswer: string;
    structuredValue?: unknown;
  },
): Promise<OnboardingAnswer> {
  return apiFetch<OnboardingAnswer>(
    token,
    `/api/athletes/${athleteId}/onboarding-sessions/${sessionId}/answers`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function completeOnboardingSession(
  token: string,
  athleteId: string,
  sessionId: string,
): Promise<OnboardingSession> {
  return apiFetch<OnboardingSession>(
    token,
    `/api/athletes/${athleteId}/onboarding-sessions/${sessionId}/complete`,
    { method: "POST" },
  );
}
