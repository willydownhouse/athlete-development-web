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

    void video.play().catch((error: unknown) => {
      if (isAbortError(error)) {
        return;
      }
    });
  }, [readUrl]);

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-lg bg-[#0f1319]"
      style={eventMediaPlayerFrameStyle(width, height)}
    >
      <video
        ref={videoRef}
        src={readUrl}
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
