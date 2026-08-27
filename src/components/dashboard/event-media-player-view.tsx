"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteEventMediaAction,
  getEventMediaAction,
  getEventMediaReadUrlAction,
} from "@/app/athlete/[athleteId]/event/[eventId]/actions";
import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { DeleteEventMediaConfirmModal } from "@/components/dashboard/delete-event-media-confirm-modal";
import { EventActionMenu } from "@/components/dashboard/event-action-menu";
import { EventMediaPlayer } from "@/components/dashboard/event-media-player";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventMediaReadUrlRefresh } from "@/hooks/use-event-media-read-url-refresh";
import { eventMediaPlayerFrameStyle } from "@/lib/event-media-player-frame";
import type { EventMediaItem, MediaReadUrlResponse, MediaStatus } from "@/lib/types";

const EVENT_MEDIA_STATUS_POLL_MS = 2000;

function formatStatus(status: MediaStatus): string {
  return status.replace(/_/g, " ");
}

function isInFlightStatus(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}

type EventMediaPlayerViewProps = {
  athleteId: string;
  eventId: string;
  item: EventMediaItem;
  assets: MediaReadUrlResponse | null;
};

export function EventMediaPlayerView({
  athleteId,
  eventId,
  item,
  assets,
}: EventMediaPlayerViewProps) {
  const router = useRouter();
  const mediaId = item.id;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaItem, setMediaItem] = useState(item);
  const [playbackAssets, setPlaybackAssets] = useState(assets);
  const [readFailed, setReadFailed] = useState(item.status === "ready" && assets === null);
  const refreshInFlightRef = useRef(false);

  useEffect(() => {
    if (!isInFlightStatus(mediaItem.status)) {
      return;
    }

    let cancelled = false;
    let requestInFlight = false;

    function isPollCancelled() {
      return cancelled;
    }

    async function poll() {
      if (requestInFlight) {
        return;
      }

      requestInFlight = true;

      try {
        const result = await getEventMediaAction(athleteId, eventId, mediaId);

        if (isPollCancelled()) {
          return;
        }

        if ("notFound" in result) {
          router.replace(athleteEventHref(athleteId, eventId));
          return;
        }

        if ("error" in result) {
          return;
        }

        if (result.status === "ready") {
          const assetsResult = await getEventMediaReadUrlAction(athleteId, eventId, mediaId);

          if (isPollCancelled()) {
            return;
          }

          if (!("error" in assetsResult)) {
            setPlaybackAssets(assetsResult);
            setReadFailed(false);
          } else {
            setReadFailed(true);
          }
        }

        setMediaItem(result);
      } finally {
        requestInFlight = false;
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, EVENT_MEDIA_STATUS_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [athleteId, eventId, mediaId, mediaItem.status, router]);

  const refreshPlaybackAssets = useCallback(async () => {
    if (refreshInFlightRef.current || mediaItem.status !== "ready") {
      return;
    }

    refreshInFlightRef.current = true;

    try {
      const result = await getEventMediaReadUrlAction(athleteId, eventId, mediaId);

      if ("error" in result) {
        if (!playbackAssets) {
          setReadFailed(true);
        }
        return;
      }

      setReadFailed(false);
      setPlaybackAssets(result);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [athleteId, eventId, mediaId, mediaItem.status, playbackAssets]);

  const getPlaybackAssets = useCallback(
    () => (playbackAssets ? ([[mediaId, playbackAssets]] as const) : []),
    [mediaId, playbackAssets],
  );

  const schedulePlaybackRefresh = useCallback(() => {
    void refreshPlaybackAssets();
  }, [refreshPlaybackAssets]);

  useEventMediaReadUrlRefresh(getPlaybackAssets, schedulePlaybackRefresh);

  const label = mediaItem.originalFilename ?? "Event video";
  const inFlight = isInFlightStatus(mediaItem.status);

  const openDeleteConfirm = () => {
    if (pending) {
      return;
    }

    setError(null);
    setConfirmKey((current) => current + 1);
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (pending) {
      return;
    }

    setConfirmOpen(false);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    setError(null);
    setPending(true);

    const result = await deleteEventMediaAction(athleteId, eventId, mediaId);

    if ("error" in result) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push(athleteEventHref(athleteId, eventId));
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Video</h1>
        </div>
        <EventActionMenu
          aria-label="Video actions"
          items={[
            {
              label: pending ? "Deleting…" : "Delete video",
              onClick: openDeleteConfirm,
              disabled: pending,
              destructive: true,
            },
          ]}
        />
      </div>

      <div className="mt-6">
        {mediaItem.status === "ready" && playbackAssets ? (
          <EventMediaPlayer
            readUrl={playbackAssets.readUrl}
            posterUrl={playbackAssets.posterUrl}
            label={label}
            width={mediaItem.originalWidth ?? null}
            height={mediaItem.originalHeight ?? null}
          />
        ) : inFlight ? (
          <div
            className="relative mx-auto overflow-hidden rounded-lg bg-[#0f1319]"
            style={eventMediaPlayerFrameStyle(
              mediaItem.originalWidth ?? null,
              mediaItem.originalHeight ?? null,
            )}
            aria-busy="true"
            aria-label={`Processing ${label}`}
          >
            <Skeleton className="h-full w-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
                aria-hidden="true"
              />
              <p className="text-center text-xs text-zinc-400">Processing…</p>
            </div>
          </div>
        ) : mediaItem.status === "ready" && readFailed ? (
          <div
            className="relative mx-auto flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#171b22] px-4 py-8 text-center"
            style={eventMediaPlayerFrameStyle(
              mediaItem.originalWidth ?? null,
              mediaItem.originalHeight ?? null,
            )}
          >
            <p className="text-sm font-medium text-zinc-300">{"Couldn't load"}</p>
          </div>
        ) : mediaItem.status === "ready" ? (
          <div
            className="relative mx-auto overflow-hidden rounded-lg bg-[#0f1319]"
            style={eventMediaPlayerFrameStyle(
              mediaItem.originalWidth ?? null,
              mediaItem.originalHeight ?? null,
            )}
            aria-busy="true"
            aria-label={`Loading ${label}`}
          >
            <Skeleton className="h-full w-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
                aria-hidden="true"
              />
              <p className="text-center text-xs text-zinc-400">Loading…</p>
            </div>
          </div>
        ) : (
          <div
            className="relative mx-auto flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#171b22] px-4 py-8 text-center"
            style={eventMediaPlayerFrameStyle(
              mediaItem.originalWidth ?? null,
              mediaItem.originalHeight ?? null,
            )}
          >
            <p className="text-sm font-medium capitalize text-zinc-300">
              {formatStatus(mediaItem.status)}
              {mediaItem.failureCode ? ` · ${mediaItem.failureCode}` : ""}
            </p>
          </div>
        )}
      </div>

      <DeleteEventMediaConfirmModal
        key={`delete-media-${confirmKey}`}
        open={confirmOpen}
        onClose={closeDeleteConfirm}
        itemLabel="video"
        pending={pending}
        error={error}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  );
}

export function EventMediaPlayerSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div
        className="relative mx-auto mt-6 overflow-hidden rounded-lg"
        style={eventMediaPlayerFrameStyle(null, null)}
      >
        <Skeleton className="h-full w-full" />
      </div>
    </>
  );
}
