import { fetchAthletes, fetchOnboardingSessions } from "@/lib/api";
import type { Athlete, OnboardingSessionSummary } from "@/lib/types";

export async function loadShellAthletes(token: string | null): Promise<Athlete[]> {
  if (!token) {
    return [];
  }

  try {
    return await fetchAthletes(token);
  } catch {
    return [];
  }
}

export async function loadShellOnboardingSessions(
  token: string | null,
): Promise<OnboardingSessionSummary[]> {
  if (!token) {
    return [];
  }

  try {
    return await fetchOnboardingSessions(token);
  } catch {
    return [];
  }
}
