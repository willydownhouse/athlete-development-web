"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import {
  deleteEventMediaAction,
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackAssets, setPlaybackAssets] = useState(assets);
  const refreshInFlightRef = useRef(false);

  const refreshPlaybackAssets = useCallback(async () => {
    if (refreshInFlightRef.current || item.status !== "ready") {
      return;
    }

    refreshInFlightRef.current = true;

    try {
      const result = await getEventMediaReadUrlAction(athleteId, eventId, item.id);

      if ("error" in result) {
        return;
      }

      setPlaybackAssets(result);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [athleteId, eventId, item.id, item.status]);

  const getPlaybackAssets = useCallback(
    () => (playbackAssets ? ([[item.id, playbackAssets]] as const) : []),
    [item.id, playbackAssets],
  );

  const schedulePlaybackRefresh = useCallback(() => {
    void refreshPlaybackAssets();
  }, [refreshPlaybackAssets]);

  useEventMediaReadUrlRefresh(getPlaybackAssets, schedulePlaybackRefresh);

  const label = item.originalFilename ?? "Event video";
  const inFlight = isInFlightStatus(item.status);

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

    const result = await deleteEventMediaAction(athleteId, eventId, item.id);

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
        {item.status === "ready" && playbackAssets ? (
          <EventMediaPlayer
            readUrl={playbackAssets.readUrl}
            posterUrl={playbackAssets.posterUrl}
            label={label}
            width={item.originalWidth ?? null}
            height={item.originalHeight ?? null}
          />
        ) : inFlight || item.status === "ready" ? (
          <div
            className="relative mx-auto overflow-hidden rounded-lg bg-[#0f1319]"
            style={eventMediaPlayerFrameStyle(
              item.originalWidth ?? null,
              item.originalHeight ?? null,
            )}
            aria-busy="true"
            aria-label={inFlight ? `Processing ${label}` : `Loading ${label}`}
          >
            <Skeleton className="h-full w-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
                aria-hidden="true"
              />
              <p className="text-center text-xs text-zinc-400">
                {inFlight ? "Processing…" : "Loading…"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="relative mx-auto flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#171b22] px-4 py-8 text-center"
            style={eventMediaPlayerFrameStyle(
              item.originalWidth ?? null,
              item.originalHeight ?? null,
            )}
          >
            <p className="text-sm font-medium capitalize text-zinc-300">
              {formatStatus(item.status)}
              {item.failureCode ? ` · ${item.failureCode}` : ""}
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
