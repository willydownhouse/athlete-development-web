"use server";

import {
  ApiError,
  completeMediaUpload,
  createMediaUploadIntent,
  deleteEventMedia,
  getEventMedia,
  getEventMediaReadUrl,
  listEventMedia,
} from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type {
  EventMediaItem,
  EventMediaListResponse,
  MediaKind,
  MediaReadUrlResponse,
  MediaUploadIntentResponse,
} from "@/lib/types";

type ActionError = { error: string };
type ActionSuccess<T> = T;

function actionError(error: unknown): ActionError {
  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong" };
}

async function requireToken(): Promise<string | ActionError> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  return token;
}

export async function listEventMediaAction(
  athleteId: string,
  eventId: string,
): Promise<ActionSuccess<EventMediaListResponse> | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    return await listEventMedia(token, athleteId, eventId);
  } catch (error) {
    return actionError(error);
  }
}

export async function getEventMediaAction(
  athleteId: string,
  eventId: string,
  mediaId: string,
): Promise<ActionSuccess<EventMediaItem> | ActionError | { notFound: true }> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    return await getEventMedia(token, athleteId, eventId, mediaId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { notFound: true };
    }

    return actionError(error);
  }
}

export async function createMediaUploadIntentAction(
  athleteId: string,
  eventId: string,
  body: {
    kind: MediaKind;
    declaredMimeType: string;
    declaredByteSize: number;
    originalFilename?: string;
  },
): Promise<ActionSuccess<MediaUploadIntentResponse> | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    return await createMediaUploadIntent(token, athleteId, eventId, body);
  } catch (error) {
    return actionError(error);
  }
}

export async function completeMediaUploadAction(
  athleteId: string,
  eventId: string,
  mediaId: string,
): Promise<ActionSuccess<{ ok: true }> | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    await completeMediaUpload(token, athleteId, eventId, mediaId);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function getEventMediaReadUrlAction(
  athleteId: string,
  eventId: string,
  mediaId: string,
): Promise<ActionSuccess<MediaReadUrlResponse> | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    return await getEventMediaReadUrl(token, athleteId, eventId, mediaId);
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteEventMediaAction(
  athleteId: string,
  eventId: string,
  mediaId: string,
): Promise<ActionSuccess<{ ok: true }> | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    await deleteEventMedia(token, athleteId, eventId, mediaId);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
