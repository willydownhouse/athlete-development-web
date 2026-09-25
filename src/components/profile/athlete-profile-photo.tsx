"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  completeAthleteMediaUploadAction,
  createAthleteMediaUploadIntentAction,
  deleteAthleteMediaAction,
  getAthleteMediaAction,
} from "@/app/athlete/[athleteId]/profile/actions";
import { EventActionMenu } from "@/components/dashboard/event-action-menu";
import {
  ATHLETE_MEDIA_STATUS_POLL_MS,
  classifyProfilePhotoFile,
  PROFILE_PHOTO_FILE_ACCEPT,
  profileUploadFailureAction,
  shouldPollAthleteMedia,
} from "@/lib/athlete-media";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import type { AthleteMediaItem } from "@/lib/types";

type AthleteProfilePhotoProps = {
  athleteId: string;
  athleteName: string;
  initials: string;
  initialMedia: AthleteMediaItem | null;
};

function profilePhotoErrorMessage(
  error: "empty" | "unsupported" | "oversize",
  messages: ReturnType<typeof getMessages>,
): string {
  if (error === "empty") {
    return messages.profile.photoEmpty;
  }

  if (error === "oversize") {
    return messages.profile.photoOversize;
  }

  return messages.profile.photoUnsupported;
}

export function AthleteProfilePhoto({
  athleteId,
  athleteName,
  initials,
  initialMedia,
}: AthleteProfilePhotoProps) {
  const messages = getMessages(useAppLocale());
  const inputRef = useRef<HTMLInputElement>(null);
  const localPreviewUrlRef = useRef<string | null>(null);
  const [media, setMedia] = useState<AthleteMediaItem | null>(initialMedia);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(
    initialMedia !== null && shouldPollAthleteMedia(initialMedia.status),
  );
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readyContentUrl = media?.status === "ready" && media.contentUrl ? media.contentUrl : null;
  const displaySrc = localPreviewUrl ?? readyContentUrl;
  const canChange = !busy && !removing;
  const canRemove = media?.status === "ready" && !busy;
  const pollingMediaId = media && shouldPollAthleteMedia(media.status) ? media.id : null;

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pollingMediaId) {
      return;
    }

    const mediaId = pollingMediaId;
    let cancelled = false;

    async function poll() {
      const result = await getAthleteMediaAction(athleteId, mediaId);

      if (cancelled || "error" in result) {
        return;
      }

      if (result.status === "ready") {
        if (localPreviewUrlRef.current) {
          URL.revokeObjectURL(localPreviewUrlRef.current);
          localPreviewUrlRef.current = null;
        }
        setLocalPreviewUrl(null);
        setBusy(false);
        setMedia(result);
        return;
      }

      if (result.status === "failed") {
        if (localPreviewUrlRef.current) {
          URL.revokeObjectURL(localPreviewUrlRef.current);
          localPreviewUrlRef.current = null;
        }
        setLocalPreviewUrl(null);
        setBusy(false);
        setMedia(result);
        setError(messages.profile.photoProcessingFailed);
        return;
      }

      setMedia((current) => (current?.status === result.status ? current : result));
    }

    const interval = window.setInterval(() => {
      void poll();
    }, ATHLETE_MEDIA_STATUS_POLL_MS);
    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [athleteId, pollingMediaId, messages.profile.photoProcessingFailed]);

  function replaceLocalPreview(file: File) {
    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    localPreviewUrlRef.current = nextUrl;
    setLocalPreviewUrl(nextUrl);
  }

  function clearLocalPreview() {
    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
      localPreviewUrlRef.current = null;
    }

    setLocalPreviewUrl(null);
  }

  async function continueUploadAfterCompleteError(mediaId: string): Promise<boolean> {
    const result = await getAthleteMediaAction(athleteId, mediaId);

    if ("error" in result) {
      return false;
    }

    const action = profileUploadFailureAction(result.status);

    if (action === "delete") {
      await deleteAthleteMediaAction(athleteId, mediaId).catch(() => undefined);
      return false;
    }

    if (action === "poll") {
      setMedia(result);
      return true;
    }

    clearLocalPreview();
    setBusy(false);
    setMedia(result);

    if (action === "failed") {
      setError(messages.profile.photoProcessingFailed);
    }

    return true;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !canChange) {
      return;
    }

    const classified = classifyProfilePhotoFile(file);

    if (!classified.ok) {
      setError(profilePhotoErrorMessage(classified.error, messages));
      return;
    }

    setError(null);
    setBusy(true);
    replaceLocalPreview(file);

    let intentId: string | null = null;
    let fileSent = false;

    try {
      const intent = await createAthleteMediaUploadIntentAction(athleteId, {
        declaredMimeType: classified.value.declaredMimeType,
        declaredByteSize: file.size,
        originalFilename: file.name,
      });

      if ("error" in intent) {
        throw new Error(intent.error);
      }

      intentId = intent.id;

      const putResponse = await fetch(intent.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": classified.value.declaredMimeType,
          "Content-Length": String(file.size),
          "If-None-Match": "*",
        },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error(messages.profile.photoUploadFailed);
      }

      fileSent = true;

      const completeResult = await completeAthleteMediaUploadAction(athleteId, intent.id);

      if ("error" in completeResult) {
        const continued = await continueUploadAfterCompleteError(intent.id);

        if (continued) {
          return;
        }

        throw new Error(completeResult.error);
      }

      setMedia({
        id: intent.id,
        slot: "profile",
        kind: "image",
        status: "queued",
        originalFilename: file.name,
        width: null,
        height: null,
        originalWidth: null,
        originalHeight: null,
        durationSeconds: null,
        failureCode: null,
        contentUrl: null,
        updatedAt: new Date().toISOString(),
      });
    } catch (uploadError) {
      if (intentId && !fileSent) {
        await deleteAthleteMediaAction(athleteId, intentId).catch(() => undefined);
      }

      clearLocalPreview();
      setBusy(false);
      setError(
        uploadError instanceof Error ? uploadError.message : messages.profile.photoUploadFailed,
      );
    }
  }

  async function handleRemove() {
    if (!media || !canRemove) {
      return;
    }

    setRemoving(true);
    setError(null);

    const result = await deleteAthleteMediaAction(athleteId, media.id);

    if ("error" in result) {
      setRemoving(false);
      setError(result.error);
      return;
    }

    setMedia(null);
    setRemoving(false);
  }

  return (
    <>
      <div className="mb-3 flex justify-end lg:absolute lg:top-4 lg:right-5 lg:z-10 lg:mb-0">
        <EventActionMenu
          aria-label={messages.profile.photoActions}
          items={[
            {
              label: busy
                ? messages.common.processing
                : readyContentUrl
                  ? messages.profile.changePhoto
                  : messages.profile.addPhoto,
              onClick: () => inputRef.current?.click(),
              disabled: !canChange,
            },
            {
              label: removing ? messages.profile.removingPhoto : messages.profile.removePhoto,
              onClick: () => {
                void handleRemove();
              },
              disabled: !canRemove || removing,
              destructive: true,
              separatorBefore: true,
            },
          ]}
        />
      </div>
      <div className="w-full lg:w-56 lg:shrink-0">
        <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-[#2a2f38] text-2xl font-semibold text-white">
          {displaySrc ? (
            // Same-origin contentUrl is proxied by Next.js with cache headers.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt={messages.profile.photoAlt(athleteName)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            initials
          )}
          {busy ? (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40"
              role="status"
              aria-live="polite"
            >
              <span
                className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              <span className="sr-only">{messages.common.processing}</span>
            </div>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept={PROFILE_PHOTO_FILE_ACCEPT}
            className="sr-only"
            onChange={(event) => {
              void handleFileChange(event);
            }}
          />
        </div>
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      </div>
    </>
  );
}
