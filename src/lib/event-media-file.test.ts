import { describe, expect, it } from "vitest";

import {
  classifyEventMediaFile,
  EVENT_MEDIA_MAX_IMAGE_BYTES,
  EVENT_MEDIA_MAX_VIDEO_BYTES,
} from "./event-media-file";

describe("classifyEventMediaFile", () => {
  it("classifies a JPEG by mime type", () => {
    expect(
      classifyEventMediaFile({ name: "practice.jpg", type: "image/jpeg", size: 204800 }),
    ).toEqual({
      ok: true,
      value: {
        kind: "image",
        declaredMimeType: "image/jpeg",
        maxBytes: EVENT_MEDIA_MAX_IMAGE_BYTES,
      },
    });
  });

  it("maps image/jpg to image/jpeg", () => {
    const result = classifyEventMediaFile({
      name: "photo.jpg",
      type: "image/jpg",
      size: 1024,
    });

    expect(result).toMatchObject({
      ok: true,
      value: { kind: "image", declaredMimeType: "image/jpeg" },
    });
  });

  it("treats an iPhone .mov with an empty type as quicktime video", () => {
    expect(classifyEventMediaFile({ name: "IMG_1234.MOV", type: "", size: 8_000_000 })).toEqual({
      ok: true,
      value: {
        kind: "video",
        declaredMimeType: "video/quicktime",
        maxBytes: EVENT_MEDIA_MAX_VIDEO_BYTES,
      },
    });
  });

  it("treats octet-stream .mp4 as mp4 video", () => {
    const result = classifyEventMediaFile({
      name: "clip.mp4",
      type: "application/octet-stream",
      size: 1024,
    });

    expect(result).toMatchObject({
      ok: true,
      value: { kind: "video", declaredMimeType: "video/mp4" },
    });
  });

  it("rejects an empty file", () => {
    expect(classifyEventMediaFile({ name: "clip.mp4", type: "video/mp4", size: 0 })).toEqual({
      ok: false,
      error: "File is empty.",
    });
  });

  it("rejects an oversize image", () => {
    expect(
      classifyEventMediaFile({
        name: "huge.jpg",
        type: "image/jpeg",
        size: EVENT_MEDIA_MAX_IMAGE_BYTES + 1,
      }),
    ).toEqual({
      ok: false,
      error: "Image must be 15 MB or smaller.",
    });
  });

  it("rejects an oversize video", () => {
    expect(
      classifyEventMediaFile({
        name: "huge.mp4",
        type: "video/mp4",
        size: EVENT_MEDIA_MAX_VIDEO_BYTES + 1,
      }),
    ).toEqual({
      ok: false,
      error: "Video must be 200 MB or smaller.",
    });
  });

  it("rejects webm and 3gp even when the extension looks playable", () => {
    expect(classifyEventMediaFile({ name: "clip.webm", type: "video/webm", size: 1024 })).toEqual({
      ok: false,
      error: "Use a JPEG, PNG, WebP, MP4, or MOV file.",
    });
    expect(classifyEventMediaFile({ name: "clip.3gp", type: "video/3gpp", size: 1024 })).toEqual({
      ok: false,
      error: "Use a JPEG, PNG, WebP, MP4, or MOV file.",
    });
  });
});
