import { fetchOnboardingSessions } from "@/lib/api";
import type { OnboardingSessionSummary } from "@/lib/types";

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
