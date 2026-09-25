import { describe, expect, it } from "vitest";

import { EVENT_MEDIA_MAX_IMAGE_BYTES } from "@/lib/event-media-file";

import {
  classifyProfilePhotoFile,
  PROFILE_PHOTO_FILE_ACCEPT,
  profileUploadFailureAction,
  shouldPollAthleteMedia,
} from "./athlete-media";

describe("classifyProfilePhotoFile", () => {
  it("accepts a JPEG profile photo", () => {
    expect(
      classifyProfilePhotoFile({ name: "portrait.jpg", type: "image/jpeg", size: 204800 }),
    ).toEqual({
      ok: true,
      value: { declaredMimeType: "image/jpeg" },
    });
  });

  it("rejects a video", () => {
    expect(classifyProfilePhotoFile({ name: "clip.mp4", type: "video/mp4", size: 1024 })).toEqual({
      ok: false,
      error: "unsupported",
    });
  });

  it("rejects an empty file", () => {
    expect(classifyProfilePhotoFile({ name: "empty.jpg", type: "image/jpeg", size: 0 })).toEqual({
      ok: false,
      error: "empty",
    });
  });

  it("rejects an oversize image", () => {
    expect(
      classifyProfilePhotoFile({
        name: "huge.jpg",
        type: "image/jpeg",
        size: EVENT_MEDIA_MAX_IMAGE_BYTES + 1,
      }),
    ).toEqual({ ok: false, error: "oversize" });
  });

  it("lists image accept types", () => {
    expect(PROFILE_PHOTO_FILE_ACCEPT).toContain("image/jpeg");
    expect(PROFILE_PHOTO_FILE_ACCEPT).not.toContain("video/mp4");
  });
});

describe("shouldPollAthleteMedia", () => {
  it("polls in-flight statuses only", () => {
    expect(shouldPollAthleteMedia("uploading")).toBe(true);
    expect(shouldPollAthleteMedia("queued")).toBe(true);
    expect(shouldPollAthleteMedia("processing")).toBe(true);
    expect(shouldPollAthleteMedia("ready")).toBe(false);
    expect(shouldPollAthleteMedia("failed")).toBe(false);
  });
});

describe("profileUploadFailureAction", () => {
  it("drops a row that is still waiting for the file to be completed", () => {
    expect(profileUploadFailureAction("uploading")).toBe("delete");
  });

  it("keeps polling once processing has started", () => {
    expect(profileUploadFailureAction("queued")).toBe("poll");
    expect(profileUploadFailureAction("processing")).toBe("poll");
  });

  it("keeps a finished row", () => {
    expect(profileUploadFailureAction("ready")).toBe("ready");
    expect(profileUploadFailureAction("failed")).toBe("failed");
  });
});
