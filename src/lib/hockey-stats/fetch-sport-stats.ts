import { fetchSportStats } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AppLocale } from "@/lib/locale";
import type { SportStats } from "@/lib/types";

export type HockeySportStatsResult =
  { sportStats: SportStats; error?: undefined } | { sportStats: null; error: string };

export async function fetchHockeySportStats(
  athleteId: string,
  sportId: string,
  startedAtFrom: string,
  startedAtTo: string,
  locale: AppLocale,
): Promise<HockeySportStatsResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { sportStats: null, error: actions.signInAgain };
  }

  try {
    const sportStats = await fetchSportStats(token, athleteId, sportId, {
      startedAtFrom,
      startedAtTo,
      locale,
    });

    return { sportStats };
  } catch (error) {
    return { sportStats: null, error: passthroughOrGeneric(error, actions.loadStats) };
  }
}
