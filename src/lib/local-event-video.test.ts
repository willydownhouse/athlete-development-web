import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  adoptLocalEventVideoId,
  forgetFailedLocalEventVideos,
  forgetLocalEventVideo,
  forgetLocalEventVideoPoster,
  forgetLocalEventVideosOutsideEvent,
  getLocalEventVideo,
  getLocalEventVideoPoster,
  getLocalEventVideoSize,
  rememberLocalEventVideo,
  rememberLocalEventVideoCaptureIfCached,
  rememberLocalEventVideoPoster,
  rememberLocalEventVideoSize,
  resetLocalEventVideosForTests,
  subscribeLocalEventVideos,
} from "./local-event-video";

describe("local event video cache", () => {
  const createObjectURL = vi.fn();
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    let count = 0;
    createObjectURL.mockReset();
    createObjectURL.mockImplementation(() => `blob:test-${++count}`);
    revokeObjectURL.mockReset();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    resetLocalEventVideosForTests();
  });

  afterEach(() => {
    resetLocalEventVideosForTests();
    vi.restoreAllMocks();
  });

  it("remembers a blob URL for a media id", () => {
    const file = new Blob(["clip"], { type: "video/mp4" });

    expect(rememberLocalEventVideo("media-1", file, "event-1")).toBe("blob:test-1");
    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(createObjectURL).toHaveBeenCalledWith(file);
  });

  it("returns null for a media id that was never remembered", () => {
    expect(getLocalEventVideo("missing")).toBeNull();
  });

  it("revokes and drops a remembered URL", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    forgetLocalEventVideo("media-1");

    expect(getLocalEventVideo("media-1")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-1");
  });

  it("is a no-op when forgetting an unknown id", () => {
    forgetLocalEventVideo("missing");
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("replaces an existing URL for the same media id", () => {
    rememberLocalEventVideo("media-1", new Blob(["first"]), "event-1");
    expect(rememberLocalEventVideo("media-1", new Blob(["second"]), "event-1")).toBe("blob:test-2");

    expect(getLocalEventVideo("media-1")).toBe("blob:test-2");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-1");
  });

  it("notifies subscribers when a video is remembered or forgotten", () => {
    const onStoreChange = vi.fn();
    const unsubscribe = subscribeLocalEventVideos(onStoreChange);

    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    forgetLocalEventVideo("media-1");
    unsubscribe();
    rememberLocalEventVideo("media-2", new Blob(["other"]), "event-1");

    expect(onStoreChange).toHaveBeenCalledTimes(2);
  });

  it("remembers a poster separately from the video file", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));

    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBe("blob:test-2");
  });

  it("drops the poster without dropping the video", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));
    forgetLocalEventVideoPoster("media-1");

    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBeNull();
  });

  it("forgets the poster when the video is forgotten", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));
    forgetLocalEventVideo("media-1");

    expect(getLocalEventVideoPoster("media-1")).toBeNull();
  });

  it("moves a cached clip to the real media id without revoking it", () => {
    rememberLocalEventVideo("local-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoPoster("local-1", new Blob(["poster"], { type: "image/jpeg" }));
    rememberLocalEventVideoSize("local-1", 1920, 1080);

    adoptLocalEventVideoId("local-1", "media-1");

    expect(getLocalEventVideo("local-1")).toBeNull();
    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBe("blob:test-2");
    expect(getLocalEventVideoSize("media-1")).toEqual({ width: 1920, height: 1080 });
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("stores a poster that finishes after the clip is adopted", async () => {
    rememberLocalEventVideo("local-1", new Blob(["clip"]), "event-1");
    let resolveCapture: (
      value: { poster: Blob | null; width: number; height: number } | null,
    ) => void = () => {};
    const capturePromise = new Promise<{
      poster: Blob | null;
      width: number;
      height: number;
    } | null>((resolve) => {
      resolveCapture = resolve;
    });

    const first = rememberLocalEventVideoCaptureIfCached("local-1", capturePromise);
    adoptLocalEventVideoId("local-1", "media-1");
    const second = rememberLocalEventVideoCaptureIfCached("media-1", capturePromise);
    resolveCapture({
      poster: new Blob(["poster"], { type: "image/jpeg" }),
      width: 1920,
      height: 1080,
    });
    await first;
    await second;

    expect(getLocalEventVideoPoster("local-1")).toBeNull();
    expect(getLocalEventVideoPoster("media-1")).toBe("blob:test-2");
    expect(getLocalEventVideoSize("media-1")).toEqual({ width: 1920, height: 1080 });
  });

  it("clears local previews for failed media only", () => {
    rememberLocalEventVideo("media-1", new Blob(["failed"]), "event-1");
    rememberLocalEventVideo("media-2", new Blob(["processing"]), "event-1");

    forgetFailedLocalEventVideos([
      { id: "media-1", status: "failed" },
      { id: "media-2", status: "processing" },
    ]);

    expect(getLocalEventVideo("media-1")).toBeNull();
    expect(getLocalEventVideo("media-2")).toBe("blob:test-2");
  });

  it("stores a captured poster when the video is still cached", async () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    const poster = new Blob(["poster"], { type: "image/jpeg" });

    await rememberLocalEventVideoCaptureIfCached(
      "media-1",
      Promise.resolve({ poster, width: 1920, height: 1080 }),
    );

    expect(getLocalEventVideoPoster("media-1")).toBe("blob:test-2");
    expect(getLocalEventVideoSize("media-1")).toEqual({ width: 1920, height: 1080 });
  });

  it("stores captured dimensions even when the poster blob is missing", async () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");

    await rememberLocalEventVideoCaptureIfCached(
      "media-1",
      Promise.resolve({ poster: null, width: 1280, height: 720 }),
    );

    expect(getLocalEventVideoPoster("media-1")).toBeNull();
    expect(getLocalEventVideoSize("media-1")).toEqual({ width: 1280, height: 720 });
  });

  it("does not store a captured poster after the video was forgotten", async () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    forgetLocalEventVideo("media-1");

    await rememberLocalEventVideoCaptureIfCached(
      "media-1",
      Promise.resolve({
        poster: new Blob(["poster"], { type: "image/jpeg" }),
        width: 1920,
        height: 1080,
      }),
    );

    expect(getLocalEventVideoPoster("media-1")).toBeNull();
    expect(getLocalEventVideoSize("media-1")).toBeNull();
  });

  it("does not store a poster if the video is forgotten while capture is in flight", async () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    let resolveCapture: (
      value: { poster: Blob | null; width: number; height: number } | null,
    ) => void = () => {};
    const capturePromise = new Promise<{
      poster: Blob | null;
      width: number;
      height: number;
    } | null>((resolve) => {
      resolveCapture = resolve;
    });

    const pending = rememberLocalEventVideoCaptureIfCached("media-1", capturePromise);
    forgetLocalEventVideo("media-1");
    resolveCapture({
      poster: new Blob(["poster"], { type: "image/jpeg" }),
      width: 1920,
      height: 1080,
    });
    await pending;

    expect(getLocalEventVideoPoster("media-1")).toBeNull();
    expect(getLocalEventVideoSize("media-1")).toBeNull();
  });

  it("does not store a poster when capture returns nothing", async () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");

    await rememberLocalEventVideoCaptureIfCached("media-1", Promise.resolve(null));

    expect(getLocalEventVideoPoster("media-1")).toBeNull();
    expect(getLocalEventVideoSize("media-1")).toBeNull();
  });

  it("swallows capture failures without dropping the video", async () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");

    await rememberLocalEventVideoCaptureIfCached(
      "media-1",
      Promise.reject(new Error("decode failed")),
    );

    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBeNull();
  });

  it("remembers frame size with the video and drops it when forgotten", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoSize("media-1", 1920, 1080);

    expect(getLocalEventVideoSize("media-1")).toEqual({ width: 1920, height: 1080 });

    forgetLocalEventVideo("media-1");

    expect(getLocalEventVideoSize("media-1")).toBeNull();
  });

  it("does not remember frame size for a video that is not cached", () => {
    rememberLocalEventVideoSize("media-1", 1920, 1080);

    expect(getLocalEventVideoSize("media-1")).toBeNull();
  });

  it("keeps local previews while remaining on the same event", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));
    rememberLocalEventVideoSize("media-1", 1920, 1080);

    forgetLocalEventVideosOutsideEvent("event-1");

    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBe("blob:test-2");
    expect(getLocalEventVideoSize("media-1")).toEqual({ width: 1920, height: 1080 });
  });

  it("drops local previews when leaving the event", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));
    rememberLocalEventVideoSize("media-1", 1920, 1080);

    forgetLocalEventVideosOutsideEvent(null);

    expect(getLocalEventVideo("media-1")).toBeNull();
    expect(getLocalEventVideoPoster("media-1")).toBeNull();
    expect(getLocalEventVideoSize("media-1")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-1");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-2");
  });

  it("drops local previews that belong to a different event", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]), "event-1");
    rememberLocalEventVideo("media-2", new Blob(["other"]), "event-2");

    forgetLocalEventVideosOutsideEvent("event-2");

    expect(getLocalEventVideo("media-1")).toBeNull();
    expect(getLocalEventVideo("media-2")).toBe("blob:test-2");
  });
});
