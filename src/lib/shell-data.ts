import { fetchAthletes } from "@/lib/api";
import { getRequestLocale } from "@/lib/locale-server";
import type { Athlete } from "@/lib/types";

export async function loadShellAthletes(token: string | null): Promise<Athlete[]> {
  if (!token) {
    return [];
  }

  try {
    return await fetchAthletes(token, await getRequestLocale());
  } catch {
    return [];
  }
}
