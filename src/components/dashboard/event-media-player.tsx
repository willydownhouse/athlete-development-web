"use client";

import { useEffect, useRef } from "react";

import { eventMediaPlayerFrameStyle } from "@/lib/event-media-player-frame";

type EventMediaPlayerProps = {
  readUrl: string;
  posterUrl: string | null;
  label: string;
  width: number | null;
  height: number | null;
  optimizingLabel?: string | null;
  onFrameSize?: (width: number, height: number) => void;
  onPlaybackReady?: () => void;
  onPlaybackError?: () => void;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function EventMediaPlayer({
  readUrl,
  posterUrl,
  label,
  width,
  height,
  optimizingLabel = null,
  onFrameSize,
  onPlaybackReady,
  onPlaybackError,
}: EventMediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onFrameSizeRef = useRef(onFrameSize);
  const onPlaybackReadyRef = useRef(onPlaybackReady);
  const onPlaybackErrorRef = useRef(onPlaybackError);

  useEffect(() => {
    onFrameSizeRef.current = onFrameSize;
    onPlaybackReadyRef.current = onPlaybackReady;
    onPlaybackErrorRef.current = onPlaybackError;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const player = video;
    const previousSrc = player.getAttribute("src");
    const isInitialLoad = previousSrc == null;
    const resumeAt = isInitialLoad ? 0 : player.currentTime;
    const shouldPlay = isInitialLoad || !player.paused;

    if (posterUrl) {
      player.poster = posterUrl;
    }

    if (previousSrc === readUrl) {
      return;
    }

    function restorePlayback() {
      if (player.videoWidth > 0 && player.videoHeight > 0) {
        onFrameSizeRef.current?.(player.videoWidth, player.videoHeight);
      }

      onPlaybackReadyRef.current?.();

      if (resumeAt > 0) {
        player.currentTime = resumeAt;
      }

      if (!shouldPlay) {
        player.pause();
        return;
      }

      void player.play().catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
      });
    }

    function handleError() {
      onPlaybackErrorRef.current?.();
    }

    player.addEventListener("loadedmetadata", restorePlayback, { once: true });
    player.addEventListener("error", handleError);
    player.autoplay = shouldPlay;
    player.src = readUrl;

    if (!shouldPlay) {
      player.pause();
    }

    return () => {
      player.removeEventListener("loadedmetadata", restorePlayback);
      player.removeEventListener("error", handleError);
    };
  }, [posterUrl, readUrl]);

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-lg bg-[#0f1319]"
      style={eventMediaPlayerFrameStyle(width, height)}
    >
      <video
        ref={videoRef}
        poster={posterUrl ?? undefined}
        autoPlay
        controls
        playsInline
        preload="auto"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {optimizingLabel ? (
        <p className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-zinc-200">
          {optimizingLabel}
        </p>
      ) : null}
    </div>
  );
}
