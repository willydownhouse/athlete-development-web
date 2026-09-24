import { classifyEventMediaFile } from "@/lib/event-media-file";
import type { MediaStatus } from "@/lib/types";

export const PROFILE_PHOTO_FILE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export const ATHLETE_MEDIA_STATUS_POLL_MS = 2000;

export type ProfilePhotoFileError = "empty" | "unsupported" | "oversize";

type ClassifiedProfilePhoto = {
  declaredMimeType: "image/jpeg" | "image/png" | "image/webp";
};

export function classifyProfilePhotoFile(file: {
  name: string;
  type: string;
  size: number;
}): { ok: true; value: ClassifiedProfilePhoto } | { ok: false; error: ProfilePhotoFileError } {
  const classified = classifyEventMediaFile(file);

  if (!classified.ok) {
    if (classified.error.startsWith("Image must be")) {
      return { ok: false, error: "oversize" };
    }

    if (classified.error === "File is empty.") {
      return { ok: false, error: "empty" };
    }

    return { ok: false, error: "unsupported" };
  }

  if (classified.value.kind !== "image") {
    return { ok: false, error: "unsupported" };
  }

  const declaredMimeType = classified.value.declaredMimeType;

  if (
    declaredMimeType !== "image/jpeg" &&
    declaredMimeType !== "image/png" &&
    declaredMimeType !== "image/webp"
  ) {
    return { ok: false, error: "unsupported" };
  }

  return {
    ok: true,
    value: { declaredMimeType },
  };
}

export function shouldPollAthleteMedia(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}
