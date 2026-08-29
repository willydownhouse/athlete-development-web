import { isInFlightMediaStatus } from "@/lib/event-media-playback";
import type { EventMediaItem, MediaStatus } from "@/lib/types";

export function createPendingVideoMediaItem(
  id: string,
  originalFilename: string,
  updatedAt = new Date().toISOString(),
): EventMediaItem {
  return {
    id,
    kind: "video",
    status: "uploading",
    originalFilename,
    width: null,
    height: null,
    originalWidth: null,
    originalHeight: null,
    durationSeconds: null,
    failureCode: null,
    updatedAt,
  };
}

export function mergePendingEventMediaItems(
  serverItems: EventMediaItem[],
  pendingItems: EventMediaItem[],
): EventMediaItem[] {
  if (pendingItems.length === 0) {
    return serverItems;
  }

  const serverIds = new Set(serverItems.map((item) => item.id));
  const extras = pendingItems.filter((item) => !serverIds.has(item.id));

  if (extras.length === 0) {
    return serverItems;
  }

  return [...serverItems, ...extras];
}

export function shouldPollEventMediaList(
  items: Array<{ id: string; status: MediaStatus }>,
  blockedPlayerMediaIds?: Record<string, true>,
): boolean {
  return items.some(
    (item) => isInFlightMediaStatus(item.status) && !blockedPlayerMediaIds?.[item.id],
  );
}
