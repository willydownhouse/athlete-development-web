import { cookies } from "next/headers";

import { normalizeTimeZone, TIME_ZONE_COOKIE_NAME } from "@/lib/time-zone";

function decodeCookieValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export async function getRequestTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  return normalizeTimeZone(decodeCookieValue(cookieStore.get(TIME_ZONE_COOKIE_NAME)?.value));
}

export async function getRequestTimeZoneCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = decodeCookieValue(cookieStore.get(TIME_ZONE_COOKIE_NAME)?.value);
  const normalized = normalizeTimeZone(value);

  return value && normalized === value ? normalized : null;
}
