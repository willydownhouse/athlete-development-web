"use client";

import { useLayoutEffect, useRef } from "react";

import { remainingVisibleViewportHeight } from "@/lib/visible-viewport";

export function useFillVisibleViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const syncHeight = () => {
      const visualViewport = window.visualViewport;
      element.style.height = `${remainingVisibleViewportHeight(
        element.getBoundingClientRect().top,
        visualViewport
          ? { offsetTop: visualViewport.offsetTop, height: visualViewport.height }
          : null,
        window.innerHeight,
      )}px`;
    };

    syncHeight();

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", syncHeight);
    visualViewport?.addEventListener("scroll", syncHeight);
    window.addEventListener("resize", syncHeight);

    return () => {
      visualViewport?.removeEventListener("resize", syncHeight);
      visualViewport?.removeEventListener("scroll", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  return ref;
}
