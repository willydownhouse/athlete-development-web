import { describe, expect, it } from "vitest";

import {
  resolveEventMediaPlaybackView,
  resolveEventMediaVideoThumbPoster,
  shouldRetryEventMediaReadUrl,
} from "./event-media-playback";

const localUrl = "blob:local-clip";
const processed = {
  readUrl: "https://storage.example/clip.mp4",
  posterUrl: "https://storage.example/poster.webp",
};

describe("resolveEventMediaPlaybackView", () => {
  it("plays a cached blob while processing", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "processing",
        failureCode: null,
        assets: null,
        localUrl,
        localPlaybackFailed: false,
        processedPlaybackFailed: false,
        readFailed: false,
      }),
    ).toEqual({
      kind: "player",
      readUrl: localUrl,
      posterUrl: null,
      showOptimizing: true,
    });
  });

  it("swaps to the signed URL when processing is ready", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "ready",
        failureCode: null,
        assets: processed,
        localUrl,
        localPlaybackFailed: false,
        processedPlaybackFailed: false,
        readFailed: false,
      }),
    ).toEqual({
      kind: "player",
      readUrl: processed.readUrl,
      posterUrl: processed.posterUrl,
      showOptimizing: false,
    });
  });

  it("shows processing when there is no cached file", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "queued",
        failureCode: null,
        assets: null,
        localUrl: null,
        localPlaybackFailed: false,
        processedPlaybackFailed: false,
        readFailed: false,
      }),
    ).toEqual({ kind: "processing" });
  });

  it("falls back to processing when the browser cannot play the local file", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "processing",
        failureCode: null,
        assets: null,
        localUrl,
        localPlaybackFailed: true,
        processedPlaybackFailed: false,
        readFailed: false,
      }),
    ).toEqual({ kind: "processing" });
  });

  it("keeps playing the local file when ready but signed URLs are not available yet", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "ready",
        failureCode: null,
        assets: null,
        localUrl,
        localPlaybackFailed: false,
        processedPlaybackFailed: false,
        readFailed: false,
      }),
    ).toEqual({
      kind: "player",
      readUrl: localUrl,
      posterUrl: null,
      showOptimizing: false,
    });
  });

  it("shows a loading state when ready with no assets or local file", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "ready",
        failureCode: null,
        assets: null,
        localUrl: null,
        localPlaybackFailed: false,
        processedPlaybackFailed: false,
        readFailed: false,
      }),
    ).toEqual({ kind: "loading" });
  });

  it("shows a load error when ready assets cannot be fetched", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "ready",
        failureCode: null,
        assets: null,
        localUrl: null,
        localPlaybackFailed: false,
        processedPlaybackFailed: false,
        readFailed: true,
      }),
    ).toEqual({ kind: "unavailable", message: "Couldn't load" });
  });

  it("falls back to the local file when processed playback fails", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "ready",
        failureCode: null,
        assets: processed,
        localUrl,
        localPlaybackFailed: false,
        processedPlaybackFailed: true,
        readFailed: false,
      }),
    ).toEqual({
      kind: "player",
      readUrl: localUrl,
      posterUrl: null,
      showOptimizing: false,
    });
  });

  it("shows a load error when processed playback fails and there is no local file", () => {
    expect(
      resolveEventMediaPlaybackView({
        status: "ready",
        failureCode: null,
        assets: processed,
        localUrl: null,
        localPlaybackFailed: false,
        processedPlaybackFailed: true,
        readFailed: false,
      }),
    ).toEqual({ kind: "unavailable", message: "Couldn't load" });
  });
});

describe("shouldRetryEventMediaReadUrl", () => {
  it("retries while ready with no signed URLs", () => {
    expect(shouldRetryEventMediaReadUrl("ready", false)).toBe(true);
  });

  it("does not retry after signed URLs arrive", () => {
    expect(shouldRetryEventMediaReadUrl("ready", true)).toBe(false);
  });

  it("does not retry while processing", () => {
    expect(shouldRetryEventMediaReadUrl("processing", false)).toBe(false);
  });
});

describe("resolveEventMediaVideoThumbPoster", () => {
  const localPosterUrl = "blob:local-poster";
  const processedPosterUrl = "https://storage.example/poster.webp";

  it("does not use a local poster until the video is in-flight after upload", () => {
    expect(
      resolveEventMediaVideoThumbPoster({
        status: "uploading",
        processedPosterUrl: null,
        localPosterUrl: null,
      }),
    ).toBeNull();
  });

  it("uses the local poster while processing", () => {
    expect(
      resolveEventMediaVideoThumbPoster({
        status: "processing",
        processedPosterUrl: null,
        localPosterUrl,
      }),
    ).toBe(localPosterUrl);
  });

  it("prefers the processed poster when it is ready", () => {
    expect(
      resolveEventMediaVideoThumbPoster({
        status: "ready",
        processedPosterUrl,
        localPosterUrl,
      }),
    ).toBe(processedPosterUrl);
  });

  it("keeps the local poster until the processed poster arrives", () => {
    expect(
      resolveEventMediaVideoThumbPoster({
        status: "ready",
        processedPosterUrl: null,
        localPosterUrl,
      }),
    ).toBe(localPosterUrl);
  });

  it("does not show a local poster after processing failed", () => {
    expect(
      resolveEventMediaVideoThumbPoster({
        status: "failed",
        processedPosterUrl: null,
        localPosterUrl,
      }),
    ).toBeNull();
  });
});
