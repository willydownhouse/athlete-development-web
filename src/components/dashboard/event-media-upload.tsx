"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  completeMediaUploadAction,
  createMediaUploadIntentAction,
  deleteEventMediaAction,
  getEventMediaReadUrlAction,
  listEventMediaAction,
} from "@/app/athlete/[athleteId]/event/[eventId]/actions";
import type { EventMediaItem, MediaStatus } from "@/lib/types";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function isInFlightStatus(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}

function formatStatus(status: MediaStatus): string {
  return status.replace(/_/g, " ");
}

type EventMediaUploadProps = {
  athleteId: string;
  eventId: string;
  pickFileRequestId?: number;
  onUploadingChange?: (uploading: boolean) => void;
};

export function EventMediaUpload({
  athleteId,
  eventId,
  pickFileRequestId = 0,
  onUploadingChange,
}: EventMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isActiveRef = useRef(true);
  const [items, setItems] = useState<EventMediaItem[]>([]);
  const [readUrls, setReadUrls] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [onUploadingChange, uploading]);

  const refreshReadUrls = useCallback(
    async (mediaItems: EventMediaItem[]) => {
      const readyItems = mediaItems.filter((item) => item.status === "ready");
      const entries = await Promise.all(
        readyItems.map(async (item) => {
          const result = await getEventMediaReadUrlAction(athleteId, eventId, item.id);

          if ("error" in result) {
            return null;
          }

          return [item.id, result.readUrl] as const;
        }),
      );

      const next: Record<string, string> = {};

      for (const entry of entries) {
        if (entry) {
          next[entry[0]] = entry[1];
        }
      }

      setReadUrls(next);
    },
    [athleteId, eventId],
  );

  const loadMedia = useCallback(async () => {
    const result = await listEventMediaAction(athleteId, eventId);

    if ("error" in result) {
      setError(result.error);
      return null;
    }

    if (!isActiveRef.current) {
      return result.items;
    }

    setItems(result.items);
    await refreshReadUrls(result.items);
    return result.items;
  }, [athleteId, eventId, refreshReadUrls]);

  useEffect(() => {
    isActiveRef.current = true;

    void (async () => {
      const result = await listEventMediaAction(athleteId, eventId);

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

      setItems(result.items);
      await refreshReadUrls(result.items);
    })();

    return () => {
      isActiveRef.current = false;
    };
  }, [athleteId, eventId, refreshReadUrls]);

  const hasInFlightItems = items.some((item) => isInFlightStatus(item.status));

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

  const handleFileChange = async (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0];
    changeEvent.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setMessage(null);

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10 MB or smaller.");
      return;
    }

    if (file.size < 1) {
      setError("Image file is empty.");
      return;
    }

    setUploading(true);
    setMessage("Uploading…");

    try {
      const intentResult = await createMediaUploadIntentAction(athleteId, eventId, {
        declaredMimeType: file.type,
        declaredByteSize: file.size,
        originalFilename: file.name,
      });

      if ("error" in intentResult) {
        throw new Error(intentResult.error);
      }

      const putResponse = await fetch(intentResult.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Content-Length": String(file.size),
        },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error("Upload to storage failed.");
      }

      setMessage("Processing…");

      const completeResult = await completeMediaUploadAction(athleteId, eventId, intentResult.id);

      if ("error" in completeResult) {
        throw new Error(completeResult.error);
      }

      await loadMedia();
      setMessage(null);
    } catch (uploadError) {
      setMessage(null);
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    setError(null);
    setDeletingId(mediaId);

    const result = await deleteEventMediaAction(athleteId, eventId, mediaId);

    setDeletingId(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    await loadMedia();
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={(event) => void handleFileChange(event)}
    />
  );

  return (
    <section className="rounded-2xl border border-white/5 bg-[#12161d] p-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Images</h2>
        <p className="mt-1 text-xs text-zinc-500">Add photos from the event menu.</p>
      </div>

      {fileInput}

      {message ? <p className="mt-3 text-sm text-zinc-400">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const readUrl = readUrls[item.id];
            const aspectRatio =
              item.width && item.height ? `${item.width} / ${item.height}` : "4 / 3";

            return (
              <li key={item.id} className="rounded-xl border border-white/5 bg-[#171b22] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {item.originalFilename ?? "Image"}
                    </p>
                    <p className="mt-1 text-xs capitalize text-zinc-500">
                      {formatStatus(item.status)}
                      {item.failureCode ? ` · ${item.failureCode}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-[#252b36] disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete"}
                  </button>
                </div>

                {item.status === "ready" && readUrl ? (
                  // Presigned MinIO URLs are short-lived and not compatible with next/image here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={readUrl}
                    alt={item.originalFilename ?? "Event image"}
                    className="mt-3 w-full rounded-lg bg-[#0f1319] object-contain"
                    style={{ aspectRatio }}
                  />
                ) : isInFlightStatus(item.status) ? (
                  <div
                    className="mt-3 animate-pulse rounded-lg bg-[#0f1319]"
                    style={{ aspectRatio }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No images yet.</p>
      )}
    </section>
  );
}
