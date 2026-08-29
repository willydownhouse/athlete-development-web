"use client";

import { useEffect, useRef, useState } from "react";

import { resolveEventMediaSourceLoad } from "@/lib/event-media-playback";
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

type PlayerLayer = "a" | "b";

const HANDOFF_SEEK_FALLBACK_MS = 400;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function otherLayer(layer: PlayerLayer): PlayerLayer {
  return layer === "a" ? "b" : "a";
}

function videoClassName(isFront: boolean): string {
  return `absolute inset-0 h-full w-full object-cover ${
    isFront ? "" : "pointer-events-none opacity-0"
  }`;
}

function reportFrameSize(
  player: HTMLVideoElement,
  onFrameSize: ((width: number, height: number) => void) | undefined,
): void {
  if (player.videoWidth > 0 && player.videoHeight > 0) {
    onFrameSize?.(player.videoWidth, player.videoHeight);
  }
}

function applyPlaybackState(player: HTMLVideoElement, shouldPlay: boolean): void {
  player.autoplay = shouldPlay;

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

function clearVideoSource(player: HTMLVideoElement): void {
  player.pause();
  player.removeAttribute("src");
  player.removeAttribute("poster");
  player.load();
}

function canSeekIncomingTo(player: HTMLVideoElement, time: number): boolean {
  return time > 0.05 && Number.isFinite(player.duration) && player.duration > 0;
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
  const layerARef = useRef<HTMLVideoElement>(null);
  const layerBRef = useRef<HTMLVideoElement>(null);
  const [front, setFront] = useState<PlayerLayer>("a");
  const [allowInitialAutoPlay, setAllowInitialAutoPlay] = useState(true);
  const frontRef = useRef(front);
  const releaseOutgoingRef = useRef(false);
  const incomingMutedRef = useRef(false);
  const onFrameSizeRef = useRef(onFrameSize);
  const onPlaybackReadyRef = useRef(onPlaybackReady);
  const onPlaybackErrorRef = useRef(onPlaybackError);

  useEffect(() => {
    frontRef.current = front;
    onFrameSizeRef.current = onFrameSize;
    onPlaybackReadyRef.current = onPlaybackReady;
    onPlaybackErrorRef.current = onPlaybackError;
  });

  function layerElement(layer: PlayerLayer): HTMLVideoElement | null {
    return layer === "a" ? layerARef.current : layerBRef.current;
  }

  useEffect(() => {
    if (!releaseOutgoingRef.current) {
      return;
    }

    releaseOutgoingRef.current = false;
    const revealed = layerElement(front);
    const outgoing = layerElement(otherLayer(front));

    if (revealed) {
      revealed.muted = incomingMutedRef.current;
    }

    if (outgoing) {
      clearVideoSource(outgoing);
    }

    onPlaybackReadyRef.current?.();
  }, [front]);

  useEffect(() => {
    const visible = layerElement(frontRef.current);
    const incoming = layerElement(otherLayer(frontRef.current));

    if (!visible || !incoming) {
      return;
    }

    const visiblePlayer = visible;
    const incomingPlayer = incoming;
    const loadMode = resolveEventMediaSourceLoad(visiblePlayer.getAttribute("src"), readUrl);

    if (loadMode === "unchanged") {
      if (posterUrl) {
        visiblePlayer.poster = posterUrl;
      }

      return;
    }

    let cancelled = false;

    function handleVisibleError() {
      onPlaybackErrorRef.current?.();
    }

    if (loadMode === "initial") {
      if (posterUrl) {
        visiblePlayer.poster = posterUrl;
      }

      function restorePlayback() {
        reportFrameSize(visiblePlayer, onFrameSizeRef.current);
        applyPlaybackState(visiblePlayer, true);
      }

      function handleCanPlay() {
        setAllowInitialAutoPlay(false);
        onPlaybackReadyRef.current?.();
      }

      visiblePlayer.addEventListener("loadedmetadata", restorePlayback, { once: true });
      visiblePlayer.addEventListener("canplay", handleCanPlay, { once: true });
      visiblePlayer.addEventListener("error", handleVisibleError);
      visiblePlayer.autoplay = true;
      visiblePlayer.src = readUrl;

      return () => {
        cancelled = true;
        visiblePlayer.removeEventListener("loadedmetadata", restorePlayback);
        visiblePlayer.removeEventListener("canplay", handleCanPlay);
        visiblePlayer.removeEventListener("error", handleVisibleError);
      };
    }

    let revealed = false;
    let seekFallback = 0;

    function detachIncomingListeners() {
      incomingPlayer.removeEventListener("canplay", handleIncomingCanPlay);
      incomingPlayer.removeEventListener("seeked", handleIncomingSeeked);
      incomingPlayer.removeEventListener("error", handleIncomingError);
      window.clearTimeout(seekFallback);
    }

    function revealIncoming() {
      if (cancelled || revealed || incomingPlayer === layerElement(frontRef.current)) {
        return;
      }

      revealed = true;
      detachIncomingListeners();
      reportFrameSize(incomingPlayer, onFrameSizeRef.current);

      const shouldPlay = !visiblePlayer.paused;
      incomingMutedRef.current = visiblePlayer.muted;
      incomingPlayer.muted = true;
      applyPlaybackState(incomingPlayer, shouldPlay);
      releaseOutgoingRef.current = true;
      setAllowInitialAutoPlay(false);
      setFront((current) => otherLayer(current));
    }

    function handleIncomingSeeked() {
      revealIncoming();
    }

    function handleIncomingCanPlay() {
      if (cancelled || revealed) {
        return;
      }

      const resumeAt = visiblePlayer.currentTime;

      if (!canSeekIncomingTo(incomingPlayer, resumeAt)) {
        revealIncoming();
        return;
      }

      incomingPlayer.addEventListener("seeked", handleIncomingSeeked, { once: true });
      seekFallback = window.setTimeout(revealIncoming, HANDOFF_SEEK_FALLBACK_MS);
      incomingPlayer.currentTime = Math.min(resumeAt, incomingPlayer.duration);
    }

    function handleIncomingError() {
      if (cancelled || revealed || incomingPlayer === layerElement(frontRef.current)) {
        return;
      }

      detachIncomingListeners();
      clearVideoSource(incomingPlayer);
      onPlaybackErrorRef.current?.();
    }

    incomingPlayer.muted = true;
    incomingPlayer.autoplay = false;

    if (posterUrl) {
      incomingPlayer.poster = posterUrl;
    }

    incomingPlayer.addEventListener("canplay", handleIncomingCanPlay, { once: true });
    incomingPlayer.addEventListener("error", handleIncomingError);
    incomingPlayer.src = readUrl;
    void incomingPlayer.play().catch((error: unknown) => {
      if (isAbortError(error)) {
        return;
      }
    });

    return () => {
      cancelled = true;
      detachIncomingListeners();

      if (
        incomingPlayer.getAttribute("src") === readUrl &&
        incomingPlayer !== layerElement(frontRef.current)
      ) {
        clearVideoSource(incomingPlayer);
      }
    };
  }, [posterUrl, readUrl]);

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-lg bg-[#0f1319]"
      style={eventMediaPlayerFrameStyle(width, height)}
    >
      <video
        ref={layerARef}
        autoPlay={allowInitialAutoPlay}
        controls={front === "a"}
        playsInline
        preload="auto"
        aria-hidden={front !== "a"}
        aria-label={front === "a" ? label : undefined}
        className={videoClassName(front === "a")}
      />
      <video
        ref={layerBRef}
        controls={front === "b"}
        playsInline
        preload="auto"
        aria-hidden={front !== "b"}
        aria-label={front === "b" ? label : undefined}
        className={videoClassName(front === "b")}
      />
      {optimizingLabel ? (
        <p className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-zinc-200">
          {optimizingLabel}
        </p>
      ) : null}
    </div>
  );
}
