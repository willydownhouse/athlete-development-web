"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { useFillVisibleViewport } from "@/hooks/use-fill-visible-viewport";

type EventPageFrameProps = {
  children: ReactNode;
  dock: ReactNode;
};

export function EventPageFrame({ children, dock }: EventPageFrameProps) {
  const rootRef = useFillVisibleViewport<HTMLDivElement>();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const dockEl = dockRef.current;
    const scroller = scrollerRef.current;
    if (!dockEl || !scroller) {
      return;
    }

    let previousHeight = dockEl.getBoundingClientRect().height;

    const observer = new ResizeObserver(() => {
      const nextHeight = dockEl.getBoundingClientRect().height;
      const delta = nextHeight - previousHeight;
      previousHeight = nextHeight;
      if (delta !== 0) {
        scroller.scrollTop += delta;
      }
    });

    observer.observe(dockEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex h-[calc(100svh-3.75rem)] min-h-0 flex-1 flex-col overflow-hidden lg:h-svh"
    >
      <div
        ref={scrollerRef}
        className="mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto px-4 pt-6 sm:px-6 lg:max-w-3xl lg:px-10"
      >
        {children}
        <div className="h-4" />
      </div>
      <div ref={dockRef} className="shrink-0">
        {dock}
      </div>
    </div>
  );
}
