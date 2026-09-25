import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadAthleteAvatarUrl, loadAthleteAvatarUrls } from "./load-athlete-avatar-url";

vi.mock("@/lib/auth-token", () => ({
  getAuthBearerToken: vi.fn(),
}));

vi.mock("@/lib/load-athlete-profile-media", () => ({
  loadAthleteProfileMedia: vi.fn(),
}));

const { getAuthBearerToken } = await import("@/lib/auth-token");
const { loadAthleteProfileMedia } = await import("@/lib/load-athlete-profile-media");

describe("loadAthleteAvatarUrl", () => {
  beforeEach(() => {
    vi.mocked(getAuthBearerToken).mockResolvedValue("token");
    vi.mocked(loadAthleteProfileMedia).mockReset();
  });

  it("returns the avatar content path when the profile photo is ready", async () => {
    vi.mocked(loadAthleteProfileMedia).mockResolvedValue({
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

    await expect(loadAthleteAvatarUrl("athlete-1")).resolves.toBe(
      "/api/athletes/a/media/media-1/content?variant=avatar",
    );
  });

  it("omits athletes without a ready photo", async () => {
    vi.mocked(loadAthleteProfileMedia).mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "media-2",
      slot: "profile",
      kind: "image",
      status: "ready",
      originalFilename: null,
      width: 1440,
      height: 1920,
      originalWidth: 1200,
      originalHeight: 1600,
      durationSeconds: null,
      failureCode: null,
      contentUrl: "/api/athletes/b/media/media-2/content",
      updatedAt: "2026-09-24T10:00:00.000Z",
    });

    await expect(loadAthleteAvatarUrls(["athlete-1", "athlete-2"])).resolves.toEqual({
      "athlete-2": "/api/athletes/b/media/media-2/content?variant=avatar",
    });
  });
});
