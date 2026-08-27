"use client";

import { useEffect, useRef } from "react";

import {
  EVENT_MEDIA_READ_URL_REFRESH_CHECK_MS,
  shouldRefreshEventMediaReadUrl,
  type EventMediaReadUrlExpiry,
} from "@/lib/event-media-read-url";

export function useEventMediaReadUrlRefresh(
  getAssets: () => Iterable<readonly [string, EventMediaReadUrlExpiry]>,
  refresh: (mediaId: string) => void,
) {
  const getAssetsRef = useRef(getAssets);
  const refreshRef = useRef(refresh);

  useEffect(() => {
    getAssetsRef.current = getAssets;
    refreshRef.current = refresh;
  }, [getAssets, refresh]);

  useEffect(() => {
    function refreshDue() {
      for (const [mediaId, assets] of getAssetsRef.current()) {
        if (shouldRefreshEventMediaReadUrl(assets)) {
          refreshRef.current(mediaId);
        }
      }
    }

    refreshDue();
    const interval = window.setInterval(refreshDue, EVENT_MEDIA_READ_URL_REFRESH_CHECK_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshDue();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
