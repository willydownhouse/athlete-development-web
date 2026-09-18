import { describe, expect, it } from "vitest";

import {
  eventMediaPlayerFrameStyle,
  resolveEventMediaPlayerFrameSize,
} from "./event-media-player-frame";

describe("eventMediaPlayerFrameStyle", () => {
  it("uses 9:16 when dimensions are unknown", () => {
    expect(eventMediaPlayerFrameStyle(null, null)).toEqual({
      aspectRatio: "9 / 16",
      width: "min(100%, calc(75svh * 9 / 16))",
    });
  });

  it("sizes the frame to the clip aspect within 75svh", () => {
    expect(eventMediaPlayerFrameStyle(1920, 1080)).toEqual({
      aspectRatio: "1920 / 1080",
      width: "min(100%, calc(75svh * 1920 / 1080))",
    });
    expect(eventMediaPlayerFrameStyle(1080, 1920)).toEqual({
      aspectRatio: "1080 / 1920",
      width: "min(100%, calc(75svh * 1080 / 1920))",
    });
  });
});

describe("resolveEventMediaPlayerFrameSize", () => {
  const localSize = { width: 1920, height: 1080 };
  const previewSize = { width: 1280, height: 720 };

  it("prefers processed original dimensions", () => {
    expect(
      resolveEventMediaPlayerFrameSize({
        originalWidth: 1080,
        originalHeight: 1920,
        localSize,
        previewSize,
      }),
    ).toEqual({ width: 1080, height: 1920 });
  });

  it("uses the cached local size before player metadata", () => {
    expect(
      resolveEventMediaPlayerFrameSize({
        originalWidth: null,
        originalHeight: null,
        localSize,
        previewSize,
      }),
    ).toEqual(localSize);
  });

  it("falls back to player metadata when nothing is cached", () => {
    expect(
      resolveEventMediaPlayerFrameSize({
        originalWidth: null,
        originalHeight: null,
        localSize: null,
        previewSize,
      }),
    ).toEqual(previewSize);
  });

  it("returns null dimensions when size is unknown", () => {
    expect(
      resolveEventMediaPlayerFrameSize({
        originalWidth: null,
        originalHeight: null,
        localSize: null,
        previewSize: null,
      }),
    ).toEqual({ width: null, height: null });
  });
});
