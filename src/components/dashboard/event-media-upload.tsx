"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  completeMediaUploadAction,
  createMediaUploadIntentAction,
  deleteEventMediaAction,
  getEventMediaReadUrlAction,
  listEventMediaAction,
} from "@/app/athlete/[athleteId]/event/[eventId]/actions";
import {
  EventMediaGallery,
  EventMediaGallerySkeleton,
} from "@/components/dashboard/event-media-gallery";
import { useEventMediaReadUrlRefresh } from "@/hooks/use-event-media-read-url-refresh";
import { classifyEventMediaFile, EVENT_MEDIA_FILE_ACCEPT } from "@/lib/event-media-file";
import { captureLocalVideoPoster } from "@/lib/local-event-video-poster";
import {
  forgetFailedLocalEventVideos,
  forgetLocalEventVideo,
  rememberLocalEventVideo,
  rememberLocalEventVideoPosterIfCached,
} from "@/lib/local-event-video";
import type { EventMediaItem, EventMediaReadAssets, MediaStatus } from "@/lib/types";

function isInFlightStatus(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}

type EventMediaUploadProps = {
  athleteId: string;
  eventId: string;
  pickFileRequestId?: number;
  deleteMediaRequestId?: number;
  onUploadingChange?: (uploading: boolean) => void;
  onActiveMediaChange?: (mediaId: string | null) => void;
  onDeleteSettled?: (error: string | null) => void;
  embedded?: boolean;
};

function EventMediaStatusIndicator({ label }: { label: string }) {
  return (
    <div
      className="mt-3 flex items-center gap-2 text-sm text-zinc-400"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

function getStatusLabel(
  uploading: boolean,
  hasInFlightItems: boolean,
  pendingFocusMediaId: string | null,
): string | null {
  if (uploading) {
    return "Uploading media…";
  }

  if (pendingFocusMediaId || hasInFlightItems) {
    return "Processing media…";
  }

  return null;
}

export function EventMediaUpload({
  athleteId,
  eventId,
  pickFileRequestId = 0,
  deleteMediaRequestId = 0,
  onUploadingChange,
  onActiveMediaChange,
  onDeleteSettled,
  embedded = false,
}: EventMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isActiveRef = useRef(true);
  const [items, setItems] = useState<EventMediaItem[]>([]);
  const [readUrls, setReadUrls] = useState<Record<string, EventMediaReadAssets>>({});
  const [readUrlErrors, setReadUrlErrors] = useState<Record<string, true>>({});
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pendingFocusMediaId, setPendingFocusMediaId] = useState<string | null>(null);
  const [galleryFocusIndex, setGalleryFocusIndex] = useState(0);
  const [galleryFocusRequestId, setGalleryFocusRequestId] = useState(0);

  const readUrlsRef = useRef(readUrls);
  const readUrlErrorsRef = useRef(readUrlErrors);
  const itemsRef = useRef(items);
  const ensureReadUrlInFlightRef = useRef(new Set<string>());
  const previousItemsRef = useRef<EventMediaItem[]>([]);
  const hasLoadedInitialMediaRef = useRef(false);
  const pendingFocusMediaIdRef = useRef<string | null>(null);
  const requestGalleryFocusRef = useRef<(index: number) => void>(() => {});
  const mediaListVersionRef = useRef(0);
  const activeMediaIdRef = useRef<string | null>(null);

  const setPendingFocus = useCallback((mediaId: string | null) => {
    pendingFocusMediaIdRef.current = mediaId;
    setPendingFocusMediaId(mediaId);
  }, []);

  useEffect(() => {
    readUrlsRef.current = readUrls;
    readUrlErrorsRef.current = readUrlErrors;
    itemsRef.current = items;
  }, [readUrls, readUrlErrors, items]);

  const hasInFlightItems = items.some((item) => isInFlightStatus(item.status));
  const statusLabel = getStatusLabel(uploading, hasInFlightItems, pendingFocusMediaId);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [onUploadingChange, uploading]);

  const handleActiveMediaChange = useCallback(
    (mediaId: string | null) => {
      activeMediaIdRef.current = mediaId;
      onActiveMediaChange?.(mediaId);
    },
    [onActiveMediaChange],
  );

  const ensureReadUrl = useCallback(
    async (mediaId: string, itemOverride?: EventMediaItem, options?: { force?: boolean }) => {
      const force = options?.force === true;

      if (ensureReadUrlInFlightRef.current.has(mediaId)) {
        return;
      }

      if (!force && (readUrlsRef.current[mediaId] || readUrlErrorsRef.current[mediaId])) {
        return;
      }

      if (force && readUrlErrorsRef.current[mediaId]) {
        return;
      }

      const item = itemOverride ?? itemsRef.current.find((entry) => entry.id === mediaId);
      if (!item || item.status !== "ready") {
        return;
      }

      ensureReadUrlInFlightRef.current.add(mediaId);

      try {
        const result = await getEventMediaReadUrlAction(athleteId, eventId, mediaId);

        if (!isActiveRef.current) {
          return;
        }

        if ("error" in result) {
          if (force && readUrlsRef.current[mediaId]) {
            return;
          }

          readUrlErrorsRef.current = { ...readUrlErrorsRef.current, [mediaId]: true };
          setReadUrlErrors((current) => ({ ...current, [mediaId]: true }));
          return;
        }

        const nextAssets: EventMediaReadAssets = {
          readUrl: result.readUrl,
          readExpiresAt: result.readExpiresAt,
          posterUrl: result.posterUrl ?? null,
          posterExpiresAt: result.posterExpiresAt,
        };

        if (readUrlErrorsRef.current[mediaId]) {
          const nextErrors = { ...readUrlErrorsRef.current };
          delete nextErrors[mediaId];
          readUrlErrorsRef.current = nextErrors;
        }
        setReadUrlErrors((current) => {
          if (!current[mediaId]) {
            return current;
          }

          const next = { ...current };
          delete next[mediaId];
          return next;
        });
        readUrlsRef.current = {
          ...readUrlsRef.current,
          [mediaId]: nextAssets,
        };
        setReadUrls((current) => ({
          ...current,
          [mediaId]: nextAssets,
        }));
        forgetLocalEventVideo(mediaId);
      } catch {
        if (!isActiveRef.current) {
          return;
        }

        if (force && readUrlsRef.current[mediaId]) {
          return;
        }

        readUrlErrorsRef.current = { ...readUrlErrorsRef.current, [mediaId]: true };
        setReadUrlErrors((current) => ({ ...current, [mediaId]: true }));
      } finally {
        ensureReadUrlInFlightRef.current.delete(mediaId);
      }
    },
    [athleteId, eventId],
  );

  const getReadUrlAssets = useCallback(() => Object.entries(readUrls), [readUrls]);
  const refreshDueReadUrl = useCallback(
    (mediaId: string) => {
      void ensureReadUrl(mediaId, undefined, { force: true });
    },
    [ensureReadUrl],
  );

  useEventMediaReadUrlRefresh(getReadUrlAssets, refreshDueReadUrl);

  const applyMediaItems = useCallback(
    (mediaItems: EventMediaItem[]) => {
      const activeIds = new Set(mediaItems.map((item) => item.id));
      const previousItemsById = new Map(previousItemsRef.current.map((item) => [item.id, item]));

      forgetFailedLocalEventVideos(mediaItems);

      for (const id of ensureReadUrlInFlightRef.current) {
        if (!activeIds.has(id)) {
          ensureReadUrlInFlightRef.current.delete(id);
        }
      }

      setItems(mediaItems);
      itemsRef.current = mediaItems;
      setReadUrls((current) => {
        const next: Record<string, EventMediaReadAssets> = {};

        for (const [id, assets] of Object.entries(current)) {
          if (activeIds.has(id)) {
            next[id] = assets;
          }
        }

        return next;
      });
      setReadUrlErrors((current) => {
        const next: Record<string, true> = {};

        for (const id of Object.keys(current)) {
          if (activeIds.has(id)) {
            next[id] = true;
          }
        }

        return next;
      });

      if (hasLoadedInitialMediaRef.current) {
        for (const item of mediaItems) {
          if (item.status !== "ready") {
            continue;
          }

          const previousItem = previousItemsById.get(item.id);
          const isNewItem = !previousItem;
          const becameReady = previousItem != null && previousItem.status !== "ready";

          if (isNewItem || becameReady) {
            void ensureReadUrl(item.id, item);
          }
        }
      }

      const pendingMediaId = pendingFocusMediaIdRef.current;

      if (pendingMediaId) {
        const pendingItem = mediaItems.find((item) => item.id === pendingMediaId);

        if (pendingItem?.status === "ready") {
          if (pendingItem.kind === "image") {
            const imageIndex = mediaItems
              .filter((item) => item.kind === "image")
              .findIndex((item) => item.id === pendingMediaId);

            if (imageIndex >= 0) {
              requestGalleryFocusRef.current(imageIndex);
            }
          }

          setPendingFocus(null);
        }
      }

      previousItemsRef.current = mediaItems;
      hasLoadedInitialMediaRef.current = true;
    },
    [ensureReadUrl, setPendingFocus],
  );

  const requestGalleryFocus = useCallback((index: number) => {
    setGalleryFocusIndex(index);
    setGalleryFocusRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    requestGalleryFocusRef.current = requestGalleryFocus;
  }, [requestGalleryFocus]);

  const loadMedia = useCallback(async () => {
    const listVersion = ++mediaListVersionRef.current;
    const result = await listEventMediaAction(athleteId, eventId);

    if (listVersion !== mediaListVersionRef.current) {
      return null;
    }

    if ("error" in result) {
      setError(result.error);
      return null;
    }

    if (!isActiveRef.current) {
      return result.items;
    }

    applyMediaItems(result.items);
    return result.items;
  }, [athleteId, eventId, applyMediaItems]);

  useEffect(() => {
    isActiveRef.current = true;

    void (async () => {
      const listVersion = ++mediaListVersionRef.current;

      try {
        const result = await listEventMediaAction(athleteId, eventId);

        if (listVersion !== mediaListVersionRef.current) {
          return;
        }

        if ("error" in result) {
          if (!isActiveRef.current) {
            return;
          }

          setError(result.error);
          return;
        }

        if (!isActiveRef.current) {
          return;
        }

        applyMediaItems(result.items);
      } finally {
        if (isActiveRef.current && listVersion === mediaListVersionRef.current) {
          setInitialLoading(false);
        }
      }
    })();

    return () => {
      isActiveRef.current = false;
    };
  }, [athleteId, eventId, applyMediaItems]);

  useEffect(() => {
    if (!hasInFlightItems) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadMedia();
    }, 2000);

    return () => window.clearInterval(interval);
  }, [hasInFlightItems, loadMedia]);

  useEffect(() => {
    if (pickFileRequestId > 0) {
      inputRef.current?.click();
    }
  }, [pickFileRequestId]);

  useEffect(() => {
    if (deleteMediaRequestId === 0) {
      return;
    }

    const mediaId = activeMediaIdRef.current;

    if (!mediaId) {
      return;
    }

    void (async () => {
      setError(null);

      const deletedItem = itemsRef.current.find((item) => item.id === mediaId);
      const deletedImageIndex =
        deletedItem?.kind === "image"
          ? itemsRef.current
              .filter((item) => item.kind === "image")
              .findIndex((item) => item.id === mediaId)
          : -1;
      const result = await deleteEventMediaAction(athleteId, eventId, mediaId);

      if ("error" in result) {
        setError(result.error);
        onDeleteSettled?.(result.error);
        return;
      }

      forgetLocalEventVideo(mediaId);

      await loadMedia();

      const remainingImages = itemsRef.current.filter((item) => item.kind === "image");

      if (deletedItem?.kind === "image" && remainingImages.length > 0) {
        requestGalleryFocus(Math.max(0, deletedImageIndex - 1));
      } else {
        handleActiveMediaChange(remainingImages[0]?.id ?? null);
      }

      onDeleteSettled?.(null);
    })();
  }, [
    athleteId,
    deleteMediaRequestId,
    eventId,
    handleActiveMediaChange,
    loadMedia,
    onDeleteSettled,
    requestGalleryFocus,
  ]);

  const handleFileChange = async (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0];
    changeEvent.target.value = "";

    if (!file) {
      return;
    }

    setError(null);

    const classified = classifyEventMediaFile(file);

    if (!classified.ok) {
      setError(classified.error);
      return;
    }

    setUploading(true);

    try {
      const intentResult = await createMediaUploadIntentAction(athleteId, eventId, {
        kind: classified.value.kind,
        declaredMimeType: classified.value.declaredMimeType,
        declaredByteSize: file.size,
        originalFilename: file.name,
      });

      if ("error" in intentResult) {
        throw new Error(intentResult.error);
      }

      const putResponse = await fetch(intentResult.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": classified.value.declaredMimeType,
          "Content-Length": String(file.size),
          "If-None-Match": "*",
        },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error("Upload to storage failed.");
      }

      const completeResult = await completeMediaUploadAction(athleteId, eventId, intentResult.id);

      if ("error" in completeResult) {
        throw new Error(completeResult.error);
      }

      if (classified.value.kind === "video") {
        rememberLocalEventVideo(intentResult.id, file);
        void rememberLocalEventVideoPosterIfCached(intentResult.id, captureLocalVideoPoster(file));
      }

      setPendingFocus(intentResult.id);
      await loadMedia();
    } catch (uploadError) {
      setPendingFocus(null);
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      await loadMedia();
    } finally {
      setUploading(false);
    }
  };

  const content = (
    <>
      <div>
        {embedded && items.length === 0 ? (
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Media</p>
        ) : embedded ? null : (
          <>
            <h2 className="text-sm font-semibold text-white">Media</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Swipe or use the dots to browse. Add more from the event menu.
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={EVENT_MEDIA_FILE_ACCEPT}
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      {statusLabel ? <EventMediaStatusIndicator label={statusLabel} /> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {initialLoading && items.length === 0 ? (
        <EventMediaGallerySkeleton />
      ) : items.length > 0 ? (
        <EventMediaGallery
          athleteId={athleteId}
          eventId={eventId}
          items={items}
          readUrls={readUrls}
          readUrlErrors={readUrlErrors}
          focusIndex={galleryFocusIndex}
          focusRequestId={galleryFocusRequestId}
          onEnsureReadUrl={ensureReadUrl}
          onActiveMediaChange={handleActiveMediaChange}
        />
      ) : (
        <p className={`text-sm text-zinc-500 ${embedded ? "mt-3" : "mt-4"}`}>No media yet.</p>
      )}
    </>
  );

  if (embedded) {
    return <div className="mt-4 border-t border-white/5 pt-4">{content}</div>;
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-[#12161d] p-4">{content}</section>
  );
}
