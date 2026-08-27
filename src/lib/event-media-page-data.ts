import { ApiError, getEventMedia, getEventMediaReadUrl } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { EventMediaItem, MediaReadUrlResponse } from "@/lib/types";

export type EventMediaPlayerPageDataResult =
  | { item: EventMediaItem; assets: MediaReadUrlResponse | null }
  | { error: string }
  | { notFound: true }
  | { redirectToEvent: true };

function toErrorResult(error: unknown): EventMediaPlayerPageDataResult {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return { notFound: true };
    }

    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Unable to load video" };
}

export async function fetchEventMediaPlayerPageData(
  athleteId: string,
  eventId: string,
  mediaId: string,
): Promise<EventMediaPlayerPageDataResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  try {
    const item = await getEventMedia(token, athleteId, eventId, mediaId);

    if (item.kind !== "video") {
      return { redirectToEvent: true };
    }

    if (item.status !== "ready") {
      return { item, assets: null };
    }

    try {
      const assets = await getEventMediaReadUrl(token, athleteId, eventId, mediaId);
      return { item, assets };
    } catch (error) {
      // 409: ready in the DB but display/playback is not available yet.
      // The player view treats ready + null assets as a load error, not a spinner.
      if (error instanceof ApiError && error.status === 409) {
        return { item, assets: null };
      }

      return toErrorResult(error);
    }
  } catch (error) {
    return toErrorResult(error);
  }
}
