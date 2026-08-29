import { describe, expect, it } from "vitest";

import {
  createPendingVideoMediaItem,
  mergePendingEventMediaItems,
  shouldPollEventMediaList,
} from "@/lib/event-media-pending";
import type { EventMediaItem } from "@/lib/types";

function readyImage(id: string): EventMediaItem {
  return {
    id,
    kind: "image",
    status: "ready",
    originalFilename: `${id}.jpg`,
    width: 1440,
    height: 1920,
    originalWidth: 1440,
    originalHeight: 1920,
    durationSeconds: null,
    failureCode: null,
    updatedAt: "2026-08-29T08:00:00.000Z",
  };
}

describe("createPendingVideoMediaItem", () => {
  it("builds an uploading video row for the optimistic thumb", () => {
    expect(createPendingVideoMediaItem("local-1", "clip.mov", "2026-08-29T08:00:00.000Z")).toEqual({
      id: "local-1",
      kind: "video",
      status: "uploading",
      originalFilename: "clip.mov",
      width: null,
      height: null,
      originalWidth: null,
      originalHeight: null,
      durationSeconds: null,
      failureCode: null,
      updatedAt: "2026-08-29T08:00:00.000Z",
    });
  });
});

describe("mergePendingEventMediaItems", () => {
  it("returns the server list when nothing is pending", () => {
    const serverItems = [readyImage("image-1")];

    expect(mergePendingEventMediaItems(serverItems, [])).toBe(serverItems);
  });

  it("keeps a chosen video until the server list includes it", () => {
    const pending = createPendingVideoMediaItem("local-1", "clip.mov", "2026-08-29T08:00:00.000Z");
    const serverItems = [readyImage("image-1")];

    expect(mergePendingEventMediaItems(serverItems, [pending])).toEqual([...serverItems, pending]);
  });

  it("drops the pending row once the server has that id", () => {
    const pending = createPendingVideoMediaItem("media-1", "clip.mov", "2026-08-29T08:00:00.000Z");
    const serverItem: EventMediaItem = {
      ...pending,
      status: "queued",
    };

    expect(mergePendingEventMediaItems([serverItem], [pending])).toEqual([serverItem]);
  });
});

describe("shouldPollEventMediaList", () => {
  it("does not poll a chosen video until upload completes", () => {
    const pending = createPendingVideoMediaItem("local-1", "clip.mov", "2026-08-29T08:00:00.000Z");

    expect(shouldPollEventMediaList([pending], { "local-1": true })).toBe(false);
  });

  it("polls after the chosen video can open the player", () => {
    const pending = createPendingVideoMediaItem("media-1", "clip.mov", "2026-08-29T08:00:00.000Z");

    expect(shouldPollEventMediaList([pending])).toBe(true);
  });

  it("still polls other in-flight media during a new upload", () => {
    const pending = createPendingVideoMediaItem("local-1", "clip.mov", "2026-08-29T08:00:00.000Z");
    const processing: EventMediaItem = {
      ...createPendingVideoMediaItem("media-2", "other.mp4", "2026-08-29T08:00:00.000Z"),
      status: "processing",
    };

    expect(shouldPollEventMediaList([processing, pending], { "local-1": true })).toBe(true);
  });

  it("does not poll when every item is finished", () => {
    expect(shouldPollEventMediaList([readyImage("image-1")])).toBe(false);
  });
});
