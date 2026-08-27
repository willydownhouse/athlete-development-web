"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { athleteEventMediaHref } from "@/components/dashboard/dashboard-nav";
import { EventMediaPlayBadge } from "@/components/dashboard/event-media-play-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMediaDuration } from "@/lib/event-media-format";
import type { EventMediaItem, EventMediaReadAssets, MediaStatus } from "@/lib/types";

const IMAGE_GALLERY_ASPECT_RATIO = "3 / 4";
const GALLERY_CARD_CLASS_NAME =
  "relative mx-auto w-full overflow-hidden rounded-lg bg-[#0f1319] max-w-[min(28rem,calc(75dvh*3/4))]";
const VIDEO_THUMB_CLASS_NAME =
  "relative w-full overflow-hidden rounded-lg bg-[#0f1319] outline-none ring-[#9ec9e8] focus-visible:ring-2";

function isInFlightStatus(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}

function formatStatus(status: MediaStatus): string {
  return status.replace(/_/g, " ");
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
  className?: string;
  label?: string;
  statusText?: string;
};

function EventMediaSlideSkeleton({
  aspectRatio,
  className = GALLERY_CARD_CLASS_NAME,
  label,
  statusText,
}: EventMediaSlideSkeletonProps) {
  return (
    <div
      className={className}
      style={{ aspectRatio }}
      aria-busy="true"
      aria-label={label ?? "Loading media"}
    >
      <Skeleton className="h-full w-full" />
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

function EventMediaDeferredImage({
  url,
  alt,
  className,
  onLoad,
  onError,
}: {
  url: string;
  alt: string;
  className: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  const [visibleUrl, setVisibleUrl] = useState(url);

  return (
    <>
      {visibleUrl !== url ? (
        // Presigned storage URLs are short-lived and not compatible with next/image here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          onLoad={() => setVisibleUrl(url)}
          className="hidden"
          draggable={false}
        />
      ) : null}
      {/* Presigned storage URLs are short-lived and not compatible with next/image here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visibleUrl}
        alt={alt}
        onLoad={onLoad}
        onError={() => {
          if (visibleUrl === url) {
            onError?.();
          }
        }}
        className={className}
        draggable={false}
      />
    </>
  );
}

type EventMediaSlideImageProps = {
  readUrl: string;
  alt: string;
};

function EventMediaSlideImage({ readUrl, alt }: EventMediaSlideImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = failedUrl === readUrl;

  if (failed) {
    return (
      <EventMediaUnavailableCard className={GALLERY_CARD_CLASS_NAME} message="Couldn't load" />
    );
  }

  return (
    <div className={GALLERY_CARD_CLASS_NAME} style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}>
      {!loaded ? (
        <div className="absolute inset-0" aria-busy="true" aria-label={`Loading ${alt}`}>
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
              aria-hidden="true"
            />
            <p className="text-center text-xs text-zinc-400">Loading…</p>
          </div>
        </div>
      ) : null}
      <EventMediaDeferredImage
        url={readUrl}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setFailedUrl(readUrl)}
        className={`absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function EventMediaUnavailableCard({ className, message }: { className: string; message: string }) {
  return (
    <div
      className={`${className} flex flex-col items-center justify-center border border-white/5 bg-[#171b22] px-3 py-6 text-center`}
      style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}
    >
      <p className="text-xs font-medium text-zinc-300 sm:text-sm">{message}</p>
    </div>
  );
}

function EventMediaVideoThumb({
  item,
  assets,
  href,
  readFailed,
}: {
  item: EventMediaItem;
  assets: EventMediaReadAssets | undefined;
  href: string;
  readFailed: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failedPosterUrl, setFailedPosterUrl] = useState<string | null>(null);
  const posterUrl = assets?.posterUrl ?? null;
  const displayFailed = posterUrl !== null && failedPosterUrl === posterUrl;
  const durationLabel = formatMediaDuration(item.durationSeconds);
  const inFlight = isInFlightStatus(item.status);
  const label = item.originalFilename ?? "Event video";
  const ariaLabel = item.status === "ready" ? `Play ${label}` : label;

  if (inFlight) {
    return (
      <Link
        href={href}
        aria-label={`Processing ${label}`}
        className={VIDEO_THUMB_CLASS_NAME}
        style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}
      >
        <EventMediaSlideSkeleton
          aspectRatio={IMAGE_GALLERY_ASPECT_RATIO}
          className="absolute inset-0"
          label={`Processing ${label}`}
          statusText="Processing…"
        />
      </Link>
    );
  }

  if (item.status !== "ready") {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`${VIDEO_THUMB_CLASS_NAME} flex flex-col items-center justify-center border border-white/5 bg-[#171b22] px-3 py-6 text-center`}
        style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}
      >
        <p className="text-xs font-medium capitalize text-zinc-300">
          {formatStatus(item.status)}
          {item.failureCode ? ` · ${item.failureCode}` : ""}
        </p>
      </Link>
    );
  }

  if (!posterUrl || displayFailed) {
    if (readFailed || assets || displayFailed) {
      return (
        <Link
          href={href}
          aria-label={ariaLabel}
          className={VIDEO_THUMB_CLASS_NAME}
          style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}
        >
          <EventMediaUnavailableCard
            className="absolute inset-0 rounded-lg"
            message="Couldn't load"
          />
        </Link>
      );
    }

    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={VIDEO_THUMB_CLASS_NAME}
        style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}
      >
        <EventMediaSlideSkeleton
          aspectRatio={IMAGE_GALLERY_ASPECT_RATIO}
          className="absolute inset-0"
          label={`Loading ${label}`}
          statusText="Loading…"
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={VIDEO_THUMB_CLASS_NAME}
      style={{ aspectRatio: IMAGE_GALLERY_ASPECT_RATIO }}
    >
      {!loaded ? <Skeleton className="absolute inset-0 h-full w-full" /> : null}
      <EventMediaDeferredImage
        url={posterUrl}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={() => setFailedPosterUrl(posterUrl)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <EventMediaPlayBadge className="h-12 w-12" />
      </span>
      {durationLabel ? (
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
          {durationLabel}
        </span>
      ) : null}
    </Link>
  );
}

export function EventMediaGallerySkeleton() {
  return (
    <div className="mt-4 rounded-xl bg-[#0f1319] p-2">
      <div className="flex min-h-[12rem] items-center justify-center sm:min-h-[14rem]">
        <EventMediaSlideSkeleton
          aspectRatio={IMAGE_GALLERY_ASPECT_RATIO}
          label="Loading media"
          statusText="Loading media…"
        />
      </div>
    </div>
  );
}

type EventMediaGalleryProps = {
  athleteId: string;
  eventId: string;
  items: EventMediaItem[];
  readUrls: Record<string, EventMediaReadAssets>;
  readUrlErrors: Record<string, true>;
  focusIndex?: number;
  focusRequestId?: number;
  onEnsureReadUrl: (mediaId: string) => void | Promise<void>;
  onActiveMediaChange?: (mediaId: string | null) => void;
};

export function EventMediaGallery({
  athleteId,
  eventId,
  items,
  readUrls,
  readUrlErrors,
  focusIndex = 0,
  focusRequestId = 0,
  onEnsureReadUrl,
  onActiveMediaChange,
}: EventMediaGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const imageItems = useMemo(() => items.filter((item) => item.kind === "image"), [items]);
  const videoItems = useMemo(() => items.filter((item) => item.kind === "video"), [items]);

  const displayIndex =
    imageItems.length === 0 ? 0 : Math.min(activeIndex, Math.max(0, imageItems.length - 1));

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      if (!container || imageItems.length === 0) {
        return;
      }

      const slideWidth = container.clientWidth;
      const clampedIndex = Math.min(Math.max(index, 0), imageItems.length - 1);

      setActiveIndex(clampedIndex);
      container.scrollTo({ left: slideWidth * clampedIndex, behavior });
    },
    [imageItems.length],
  );

  useEffect(() => {
    if (focusRequestId === 0 || imageItems.length === 0) {
      return;
    }

    scrollToIndex(focusIndex, "auto");
  }, [focusIndex, focusRequestId, imageItems.length, scrollToIndex]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || imageItems.length <= 1) {
      return;
    }

    function syncActiveIndex() {
      const containerEl = scrollRef.current;
      if (!containerEl || containerEl.clientWidth === 0) {
        return;
      }

      const index = Math.round(containerEl.scrollLeft / containerEl.clientWidth);
      setActiveIndex(Math.min(Math.max(index, 0), imageItems.length - 1));
    }

    container.addEventListener("scroll", syncActiveIndex, { passive: true });
    container.addEventListener("scrollend", syncActiveIndex);

    return () => {
      container.removeEventListener("scroll", syncActiveIndex);
      container.removeEventListener("scrollend", syncActiveIndex);
    };
  }, [imageItems.length]);

  useEffect(() => {
    for (const index of prefetchIndices(displayIndex, imageItems.length)) {
      const item = imageItems[index];

      if (item?.status === "ready" && !readUrls[item.id] && !readUrlErrors[item.id]) {
        void onEnsureReadUrl(item.id);
      }
    }
  }, [displayIndex, imageItems, readUrlErrors, readUrls, onEnsureReadUrl]);

  useEffect(() => {
    for (const item of videoItems) {
      if (item.status === "ready" && !readUrls[item.id] && !readUrlErrors[item.id]) {
        void onEnsureReadUrl(item.id);
      }
    }
  }, [videoItems, readUrlErrors, readUrls, onEnsureReadUrl]);

  useEffect(() => {
    onActiveMediaChange?.(imageItems[displayIndex]?.id ?? null);
  }, [displayIndex, imageItems, onActiveMediaChange]);

  if (imageItems.length === 0 && videoItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {imageItems.length > 0 ? (
        <>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Images
          </p>
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl bg-[#0f1319] touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-roledescription="carousel"
            aria-label="Event photos"
          >
            {imageItems.map((item, index) => {
              const assets = readUrls[item.id];
              const alt = `Event photo ${index + 1}`;
              const readFailed = Boolean(readUrlErrors[item.id]);
              const showSkeleton =
                isInFlightStatus(item.status) ||
                (item.status === "ready" && !assets && !readFailed);

              return (
                <div
                  key={item.id}
                  className="w-full shrink-0 snap-start snap-always"
                  aria-roledescription="slide"
                  aria-label={`Photo ${index + 1} of ${imageItems.length}`}
                  aria-hidden={index !== displayIndex}
                >
                  <div className="flex min-h-[12rem] items-center justify-center p-2 sm:min-h-[14rem]">
                    {showSkeleton ? (
                      <EventMediaSlideSkeleton
                        aspectRatio={IMAGE_GALLERY_ASPECT_RATIO}
                        label={
                          isInFlightStatus(item.status) ? `Processing ${alt}` : `Loading ${alt}`
                        }
                        statusText={isInFlightStatus(item.status) ? "Processing…" : "Loading…"}
                      />
                    ) : item.status === "ready" && assets ? (
                      <EventMediaSlideImage readUrl={assets.readUrl} alt={alt} />
                    ) : (
                      <EventMediaUnavailableCard
                        className={GALLERY_CARD_CLASS_NAME}
                        message={
                          readFailed
                            ? "Couldn't load"
                            : `${formatStatus(item.status)}${item.failureCode ? ` · ${item.failureCode}` : ""}`
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {imageItems.length > 1 ? (
            <div
              className="mt-3 flex items-center justify-center gap-2"
              role="tablist"
              aria-label="Choose photo"
            >
              {imageItems.map((item, index) => {
                const isActive = index === displayIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show photo ${index + 1}`}
                    onClick={() => scrollToIndex(index)}
                    className={`rounded-full transition ${
                      isActive ? "h-2 w-2 bg-[#9ec9e8]" : "h-2 w-2 bg-zinc-600 hover:bg-zinc-400"
                    }`}
                  />
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}

      {videoItems.length > 0 ? (
        <div className={imageItems.length > 0 ? "mt-4" : undefined}>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Videos
          </p>
          <div className="grid grid-cols-2 gap-2">
            {videoItems.map((item) => (
              <EventMediaVideoThumb
                key={item.id}
                item={item}
                assets={readUrls[item.id]}
                href={athleteEventMediaHref(athleteId, eventId, item.id)}
                readFailed={Boolean(readUrlErrors[item.id])}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
