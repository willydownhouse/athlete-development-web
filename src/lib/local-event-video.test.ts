import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  forgetLocalEventVideo,
  forgetLocalEventVideoPoster,
  getLocalEventVideo,
  getLocalEventVideoPoster,
  rememberLocalEventVideo,
  rememberLocalEventVideoPoster,
  resetLocalEventVideosForTests,
  subscribeLocalEventVideos,
} from "./local-event-video";

describe("local event video cache", () => {
  const createObjectURL = vi.fn();
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    let count = 0;
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

    expect(rememberLocalEventVideo("media-1", file)).toBe("blob:test-1");
    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(createObjectURL).toHaveBeenCalledWith(file);
  });

  it("returns null for a media id that was never remembered", () => {
    expect(getLocalEventVideo("missing")).toBeNull();
  });

  it("revokes and drops a remembered URL", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]));
    forgetLocalEventVideo("media-1");

    expect(getLocalEventVideo("media-1")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-1");
  });

  it("is a no-op when forgetting an unknown id", () => {
    forgetLocalEventVideo("missing");
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("replaces an existing URL for the same media id", () => {
    rememberLocalEventVideo("media-1", new Blob(["first"]));
    expect(rememberLocalEventVideo("media-1", new Blob(["second"]))).toBe("blob:test-2");

    expect(getLocalEventVideo("media-1")).toBe("blob:test-2");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-1");
  });

  it("notifies subscribers when a video is remembered or forgotten", () => {
    const onStoreChange = vi.fn();
    const unsubscribe = subscribeLocalEventVideos(onStoreChange);

    rememberLocalEventVideo("media-1", new Blob(["clip"]));
    forgetLocalEventVideo("media-1");
    unsubscribe();
    rememberLocalEventVideo("media-2", new Blob(["other"]));

    expect(onStoreChange).toHaveBeenCalledTimes(2);
  });

  it("remembers a poster separately from the video file", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]));
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));

    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBe("blob:test-2");
  });

  it("drops the poster without dropping the video", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]));
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));
    forgetLocalEventVideoPoster("media-1");

    expect(getLocalEventVideo("media-1")).toBe("blob:test-1");
    expect(getLocalEventVideoPoster("media-1")).toBeNull();
  });

  it("forgets the poster when the video is forgotten", () => {
    rememberLocalEventVideo("media-1", new Blob(["clip"]));
    rememberLocalEventVideoPoster("media-1", new Blob(["poster"], { type: "image/jpeg" }));
    forgetLocalEventVideo("media-1");

    expect(getLocalEventVideoPoster("media-1")).toBeNull();
  });
});
