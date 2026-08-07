import { fetchAthletes } from "@/lib/api";
import type { Athlete } from "@/lib/types";

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
