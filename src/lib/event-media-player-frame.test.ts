import { describe, expect, it } from "vitest";

import { eventMediaPlayerFrameStyle } from "./event-media-player-frame";

describe("eventMediaPlayerFrameStyle", () => {
  it("uses 9:16 when dimensions are unknown", () => {
    expect(eventMediaPlayerFrameStyle(null, null)).toEqual({
      aspectRatio: "9 / 16",
      width: "min(100%, calc(75dvh * 9 / 16))",
    });
  });

  it("sizes the frame to the clip aspect within 75dvh", () => {
    expect(eventMediaPlayerFrameStyle(1920, 1080)).toEqual({
      aspectRatio: "1920 / 1080",
      width: "min(100%, calc(75dvh * 1920 / 1080))",
    });
    expect(eventMediaPlayerFrameStyle(1080, 1920)).toEqual({
      aspectRatio: "1080 / 1920",
      width: "min(100%, calc(75dvh * 1080 / 1920))",
    });
  });
});
