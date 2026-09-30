import { cache } from "react";

import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellAthletes } from "@/lib/shell-data";
import type { Athlete } from "@/lib/types";

export const loadAccessibleAthlete = cache(async (athleteId: string): Promise<Athlete | null> => {
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    return null;
  }

  const token = await getAuthBearerToken();

  if (!token) {
    return null;
  }

  const athletes = await loadShellAthletes(token);
  return athletes.find((item) => item.id === normalizedAthleteId) ?? null;
});
