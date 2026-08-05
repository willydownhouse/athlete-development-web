"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  getSystemTimeZone,
  isValidTimeZone,
  TIME_ZONE_COOKIE_MAX_AGE_SECONDS,
  TIME_ZONE_COOKIE_NAME,
} from "@/lib/time-zone";

function getCookieValue(name: string): string | null {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie);
  } catch {
    return null;
  }
}

export function TimeZoneCookieSync() {
  const router = useRouter();

  useEffect(() => {
    const timeZone = getSystemTimeZone();

    if (!isValidTimeZone(timeZone) || getCookieValue(TIME_ZONE_COOKIE_NAME) === timeZone) {
      return;
    }

    document.cookie = `${TIME_ZONE_COOKIE_NAME}=${encodeURIComponent(
      timeZone,
    )}; Path=/; Max-Age=${TIME_ZONE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    router.refresh();
  }, [router]);

  return null;
}
