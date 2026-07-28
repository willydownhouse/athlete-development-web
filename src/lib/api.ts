import type { Athlete, AthleteListResponse, EventType, UserRole } from "./types";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

async function apiFetch<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
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

export async function fetchEventTypes(sportId?: string): Promise<EventType[]> {
  const query = sportId ? `?sportId=${encodeURIComponent(sportId)}` : "";
  const response = await fetch(`${getApiBaseUrl()}/api/event-types${query}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const result = (await response.json()) as { items: EventType[] };
  return result.items;
}
