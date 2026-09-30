"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const RESUME_REFRESH_INTERVAL_MS = 60_000;

export function RefreshOnResume() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    lastRefreshAt.current = Date.now();

    function refreshWhenVisible() {
      const now = Date.now();
      const elapsedMs = now - lastRefreshAt.current;

      if (document.visibilityState !== "visible") {
        return;
      }

      if (elapsedMs < RESUME_REFRESH_INTERVAL_MS) {
        return;
      }

      lastRefreshAt.current = now;
      router.refresh();
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [router]);

  return null;
}
