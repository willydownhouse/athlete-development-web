"use client";

import { useEffect, useState } from "react";

const LOADING_SKELETON_DELAY_MS = 300;

export function useDelayedLoading(
  isLoading: boolean,
  delayMs = LOADING_SKELETON_DELAY_MS,
): boolean {
  const [pastDelay, setPastDelay] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPastDelay(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      setPastDelay(false);
    };
  }, [delayMs, isLoading]);

  return isLoading && pastDelay;
}
