import type { MediaStatus } from "@/lib/types";

export function isInFlightMediaStatus(status: MediaStatus): boolean {
  return status === "uploading" || status === "queued" || status === "processing";
}

export function shouldRetryEventMediaReadUrl(
  status: MediaStatus,
  hasPlaybackAssets: boolean,
): boolean {
  return status === "ready" && !hasPlaybackAssets;
}

export function resolveEventMediaSourceLoad(
  currentSrc: string | null,
  nextUrl: string,
): "unchanged" | "initial" | "handoff" {
  if (currentSrc === nextUrl) {
    return "unchanged";
  }

  if (currentSrc == null) {
    return "initial";
  }

  return "handoff";
}

export type EventMediaPlaybackView =
  | {
      kind: "player";
      readUrl: string;
      posterUrl: string | null;
    }
  | { kind: "processing" }
  | { kind: "loading" }
  | { kind: "unavailable"; message: string };

type EventMediaPlaybackInput = {
  status: MediaStatus;
  failureCode: string | null;
  assets: { readUrl: string; posterUrl: string | null } | null;
  localUrl: string | null;
  localPlaybackFailed: boolean;
  processedPlaybackFailed: boolean;
  readFailed: boolean;
};

function formatStatus(status: MediaStatus): string {
  return status.replace(/_/g, " ");
}

export function resolveEventMediaPlaybackView(
  input: EventMediaPlaybackInput,
): EventMediaPlaybackView {
  if (input.assets && !input.processedPlaybackFailed) {
    return {
      kind: "player",
      readUrl: input.assets.readUrl,
      posterUrl: input.assets.posterUrl,
    };
  }

  const localUrl = input.localUrl && !input.localPlaybackFailed ? input.localUrl : null;

  if (localUrl) {
    return {
      kind: "player",
      readUrl: localUrl,
      posterUrl: null,
    };
  }

  if (isInFlightMediaStatus(input.status)) {
    return { kind: "processing" };
  }

  if (input.status === "ready" && (input.readFailed || input.processedPlaybackFailed)) {
    return { kind: "unavailable", message: "Couldn't load" };
  }

  if (input.status === "ready") {
    return { kind: "loading" };
  }

  const statusLabel = formatStatus(input.status);

  return {
    kind: "unavailable",
    message: input.failureCode ? `${statusLabel} · ${input.failureCode}` : statusLabel,
  };
}

export function resolveEventMediaVideoThumbPoster(input: {
  status: MediaStatus;
  processedPosterUrl: string | null;
  localPosterUrl: string | null;
}): string | null {
  if (input.processedPosterUrl) {
    return input.processedPosterUrl;
  }

  if (input.localPosterUrl && (isInFlightMediaStatus(input.status) || input.status === "ready")) {
    return input.localPosterUrl;
  }

  return null;
}
