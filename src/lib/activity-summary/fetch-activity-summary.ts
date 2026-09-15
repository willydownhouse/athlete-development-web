import { ApiError, fetchActivitySummary } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { ActivitySummary } from "@/lib/types";

export type ActivitySummaryResult =
  { summary: ActivitySummary; error?: undefined } | { summary: null; error: string };

export async function loadActivitySummary(
  athleteId: string,
  query: {
    startedAtFrom: string;
    startedAtTo: string;
    timeZone: string;
  },
): Promise<ActivitySummaryResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { summary: null, error: "You need to sign in again" };
  }

  try {
    const summary = await fetchActivitySummary(token, athleteId, query);

    return { summary };
  } catch (error) {
    if (error instanceof ApiError) {
      return { summary: null, error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { summary: null, error: error.message };
    }

    return { summary: null, error: "Unable to load activity summary" };
  }
}
