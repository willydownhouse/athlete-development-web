"use client";

import { useEffect, useRef } from "react";

import { eventMediaPlayerFrameStyle } from "@/lib/event-media-player-frame";

type EventMediaPlayerProps = {
  readUrl: string;
  posterUrl: string | null;
  label: string;
  width: number | null;
  height: number | null;
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
}: EventMediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
      if (resumeAt > 0) {
        player.currentTime = resumeAt;
      }

      if (shouldPlay) {
        void player.play().catch((error: unknown) => {
          if (isAbortError(error)) {
            return;
          }
        });
      }
    }

    player.addEventListener("loadedmetadata", restorePlayback, { once: true });
    player.src = readUrl;

    return () => {
      player.removeEventListener("loadedmetadata", restorePlayback);
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
    </div>
  );
}
