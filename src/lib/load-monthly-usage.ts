import { fetchMonthlyUsage } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { MonthlyUsage } from "@/lib/types";

export type MonthlyUsageResult =
  { usage: MonthlyUsage; error?: undefined } | { usage: null; error: string };

export async function loadMonthlyUsage(): Promise<MonthlyUsageResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { usage: null, error: actions.loadUsage };
  }

  try {
    const usage = await fetchMonthlyUsage(token);
    return { usage };
  } catch (error) {
    return { usage: null, error: passthroughOrGeneric(error, actions.loadUsage) };
  }
}
