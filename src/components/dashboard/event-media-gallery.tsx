"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { EventMediaItem, MediaStatus } from "@/lib/types";

function isInFlightStatus(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}

function formatStatus(status: MediaStatus): string {
  return status.replace(/_/g, " ");
}

function getAspectRatio(item: EventMediaItem): string {
  return item.width && item.height ? `${item.width} / ${item.height}` : "4 / 3";
}

function prefetchIndices(activeIndex: number, length: number): number[] {
  if (length === 0) {
    return [];
  }

  const indices: number[] = [];

  for (let offset = -1; offset <= 1; offset += 1) {
    const index = activeIndex + offset;

    if (index >= 0 && index < length) {
      indices.push(index);
    }
  }

  return indices;
}

type EventMediaSlideSkeletonProps = {
  aspectRatio: string;
  label?: string;
  statusText?: string;
};

function EventMediaSlideSkeleton({ aspectRatio, label, statusText }: EventMediaSlideSkeletonProps) {
  return (
    <div
      className="relative w-full max-w-md max-h-[min(70vw,28rem)]"
      style={{ aspectRatio }}
      aria-busy="true"
      aria-label={label ?? "Loading media"}
    >
      <Skeleton className="h-full w-full rounded-lg" style={{ aspectRatio }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
          aria-hidden="true"
        />
        {statusText ? <p className="text-center text-xs text-zinc-400">{statusText}</p> : null}
      </div>
    </div>
  );
}

type EventMediaSlideImageProps = {
  readUrl: string;
  alt: string;
  aspectRatio: string;
};

function EventMediaSlideImage({ readUrl, alt, aspectRatio }: EventMediaSlideImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-md max-h-[min(70vw,28rem)]" style={{ aspectRatio }}>
      {!loaded ? (
        <EventMediaSlideSkeleton
          aspectRatio={aspectRatio}
          label={`Loading ${alt}`}
          statusText="Loading…"
        />
      ) : null}
      {/* Presigned storage URLs are short-lived and not compatible with next/image here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={readUrl}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`max-h-[min(70vw,28rem)] w-full select-none rounded-lg object-contain transition-opacity duration-200 ${
          loaded ? "relative opacity-100" : "absolute inset-0 opacity-0"
        }`}
        style={{ aspectRatio }}
        draggable={false}
      />
    </div>
  );
}

export function EventMediaGallerySkeleton() {
  return (
    <div className="mt-4 rounded-xl bg-[#0f1319] p-2">
      <div className="flex min-h-[12rem] items-center justify-center sm:min-h-[14rem]">
        <EventMediaSlideSkeleton
          aspectRatio="4 / 3"
          label="Loading media"
          statusText="Loading media…"
        />
      </div>
    </div>
  );
}

type EventMediaGalleryProps = {
  items: EventMediaItem[];
  readUrls: Record<string, string>;
  focusIndex?: number;
  focusRequestId?: number;
  onEnsureReadUrl: (mediaId: string) => void | Promise<void>;
  onActiveMediaChange?: (mediaId: string | null) => void;
};

export function EventMediaGallery({
  items,
  readUrls,
  focusIndex = 0,
  focusRequestId = 0,
  onEnsureReadUrl,
  onActiveMediaChange,
}: EventMediaGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayIndex =
    items.length === 0 ? 0 : Math.min(activeIndex, Math.max(0, items.length - 1));

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      if (!container || items.length === 0) {
        return;
      }

      const slideWidth = container.clientWidth;
      const clampedIndex = Math.min(Math.max(index, 0), items.length - 1);

      setActiveIndex(clampedIndex);
      container.scrollTo({ left: slideWidth * clampedIndex, behavior });
    },
    [items.length],
  );

  useEffect(() => {
    if (focusRequestId === 0 || items.length === 0) {
      return;
    }

    scrollToIndex(focusIndex, "auto");
  }, [focusIndex, focusRequestId, items.length, scrollToIndex]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length <= 1) {
      return;
    }

    function syncActiveIndex() {
      const containerEl = scrollRef.current;
      if (!containerEl || containerEl.clientWidth === 0) {
        return;
      }

      const index = Math.round(containerEl.scrollLeft / containerEl.clientWidth);
      setActiveIndex(Math.min(Math.max(index, 0), items.length - 1));
    }

    container.addEventListener("scroll", syncActiveIndex, { passive: true });
    container.addEventListener("scrollend", syncActiveIndex);

    return () => {
      container.removeEventListener("scroll", syncActiveIndex);
      container.removeEventListener("scrollend", syncActiveIndex);
    };
  }, [items.length]);

  useEffect(() => {
    for (const index of prefetchIndices(displayIndex, items.length)) {
      const item = items[index];

      if (item?.status === "ready" && !readUrls[item.id]) {
        void onEnsureReadUrl(item.id);
      }
    }
  }, [displayIndex, items, readUrls, onEnsureReadUrl]);

  useEffect(() => {
    const activeItem = items[displayIndex];
    onActiveMediaChange?.(activeItem?.id ?? null);
  }, [displayIndex, items, onActiveMediaChange]);

  return (
    <div className="mt-4">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl bg-[#0f1319] touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label="Event media"
      >
        {items.map((item, index) => {
          const readUrl = readUrls[item.id];
          const aspectRatio = getAspectRatio(item);
          const alt = `Event media ${index + 1}`;
          const showSkeleton =
            isInFlightStatus(item.status) || (item.status === "ready" && !readUrl);

          return (
            <div
              key={item.id}
              className="w-full shrink-0 snap-start snap-always"
              aria-roledescription="slide"
              aria-label={`Media ${index + 1} of ${items.length}`}
              aria-hidden={index !== displayIndex}
            >
              <div className="flex min-h-[12rem] items-center justify-center p-2 sm:min-h-[14rem]">
                {showSkeleton ? (
                  <EventMediaSlideSkeleton
                    aspectRatio={aspectRatio}
                    label={isInFlightStatus(item.status) ? `Processing ${alt}` : `Loading ${alt}`}
                    statusText={isInFlightStatus(item.status) ? "Processing…" : "Loading…"}
                  />
                ) : item.status === "ready" && readUrl ? (
                  <EventMediaSlideImage
                    key={readUrl}
                    readUrl={readUrl}
                    alt={alt}
                    aspectRatio={aspectRatio}
                  />
                ) : (
                  <div
                    className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-white/5 bg-[#171b22] px-4 py-8 text-center"
                    style={{ aspectRatio }}
                  >
                    <p className="text-sm font-medium capitalize text-zinc-300">
                      {formatStatus(item.status)}
                      {item.failureCode ? ` · ${item.failureCode}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 1 ? (
        <div
          className="mt-3 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Choose media"
        >
          {items.map((item, index) => {
            const isActive = index === displayIndex;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show media ${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className={`rounded-full transition ${
                  isActive ? "h-2 w-2 bg-[#9ec9e8]" : "h-2 w-2 bg-zinc-600 hover:bg-zinc-400"
                }`}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
