import { fetchAthleteStreak } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { AthleteStreak } from "@/lib/types";

export type AthleteStreakResult =
  { streak: AthleteStreak; error?: undefined } | { streak: null; error: string };

export async function loadAthleteStreak(
  athleteId: string,
  timeZone: string,
): Promise<AthleteStreakResult> {
  const [token, locale] = await Promise.all([getAuthBearerToken(), getRequestLocale()]);

  if (!token) {
    return { streak: null, error: getMessages(locale).actions.signInAgain };
  }

  try {
    const streak = await fetchAthleteStreak(token, athleteId, timeZone);

    return { streak };
  } catch {
    return { streak: null, error: getMessages(locale).dashboard.streakLoadError };
  }
}
