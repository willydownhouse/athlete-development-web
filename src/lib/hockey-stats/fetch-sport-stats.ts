import { ApiError, fetchSportStats } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { SportStats } from "@/lib/types";

export type HockeySportStatsResult =
  { sportStats: SportStats; error?: undefined } | { sportStats: null; error: string };

export async function fetchHockeySportStats(
  athleteId: string,
  sportId: string,
  startedAtFrom: string,
  startedAtTo: string,
): Promise<HockeySportStatsResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { sportStats: null, error: "You need to sign in again" };
  }

  try {
    const sportStats = await fetchSportStats(token, athleteId, sportId, {
      startedAtFrom,
      startedAtTo,
    });

    return { sportStats };
  } catch (error) {
    if (error instanceof ApiError) {
      return { sportStats: null, error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { sportStats: null, error: error.message };
    }

    return { sportStats: null, error: "Unable to load hockey stats" };
  }
}
