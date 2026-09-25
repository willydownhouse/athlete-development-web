import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { loadAthleteProfileMedia } from "./load-athlete-profile-media";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getCurrentAthleteMedia: vi.fn(),
  };
});

const { getCurrentAthleteMedia } = await import("@/lib/api");

describe("loadAthleteProfileMedia", () => {
  it("returns the current row", async () => {
    vi.mocked(getCurrentAthleteMedia).mockResolvedValue({
      id: "media-1",
      slot: "profile",
      kind: "image",
      status: "ready",
      originalFilename: "portrait.jpg",
      width: 1440,
      height: 1920,
      originalWidth: 1200,
      originalHeight: 1600,
      durationSeconds: null,
      failureCode: null,
      contentUrl: "/api/athletes/a/media/media-1/content",
      updatedAt: "2026-09-24T10:00:00.000Z",
    });

    await expect(loadAthleteProfileMedia("token", "athlete-1")).resolves.toMatchObject({
      id: "media-1",
      status: "ready",
    });
  });

  it("returns null when there is no current photo", async () => {
    vi.mocked(getCurrentAthleteMedia).mockRejectedValue(
      new ApiError("missing", 404, "Media not found"),
    );

    await expect(loadAthleteProfileMedia("token", "athlete-1")).resolves.toBeNull();
  });
});
