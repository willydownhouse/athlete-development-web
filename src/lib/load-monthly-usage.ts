import { ApiError, fetchMonthlyUsage } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { MonthlyUsage } from "@/lib/types";

export type MonthlyUsageResult =
  { usage: MonthlyUsage; error?: undefined } | { usage: null; error: string };

export async function loadMonthlyUsage(): Promise<MonthlyUsageResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { usage: null, error: "Unable to load usage" };
  }

  try {
    const usage = await fetchMonthlyUsage(token);
    return { usage };
  } catch (error) {
    if (error instanceof ApiError) {
      return { usage: null, error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { usage: null, error: error.message };
    }

    return { usage: null, error: "Unable to load usage" };
  }
}
