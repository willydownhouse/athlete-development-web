import { ApiError, getCurrentAthleteMedia } from "@/lib/api";
import type { AthleteMediaItem } from "@/lib/types";

export async function loadAthleteProfileMedia(
  token: string,
  athleteId: string,
): Promise<AthleteMediaItem | null> {
  try {
    return await getCurrentAthleteMedia(token, athleteId, "profile");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
