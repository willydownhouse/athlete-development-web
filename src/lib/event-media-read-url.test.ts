import { describe, expect, it } from "vitest";

import {
  EVENT_MEDIA_READ_URL_REFRESH_LEAD_MS,
  msUntilEventMediaReadUrlRefresh,
  shouldRefreshEventMediaReadUrl,
} from "./event-media-read-url";

const NOW_MS = Date.parse("2026-08-25T12:00:00.000Z");

describe("msUntilEventMediaReadUrlRefresh", () => {
  it("refreshes 30 seconds before the read URL expires", () => {
    expect(
      msUntilEventMediaReadUrlRefresh(
        {
          readExpiresAt: "2026-08-25T12:05:00.000Z",
          posterExpiresAt: null,
        },
        NOW_MS,
      ),
    ).toBe(300_000 - EVENT_MEDIA_READ_URL_REFRESH_LEAD_MS);
  });

  it("uses the earlier of read and poster expiry", () => {
    expect(
      msUntilEventMediaReadUrlRefresh(
        {
          readExpiresAt: "2026-08-25T12:05:00.000Z",
          posterExpiresAt: "2026-08-25T12:04:00.000Z",
        },
        NOW_MS,
      ),
    ).toBe(240_000 - EVENT_MEDIA_READ_URL_REFRESH_LEAD_MS);
  });

  it("returns 0 when expiry is already inside the lead window", () => {
    expect(
      msUntilEventMediaReadUrlRefresh(
        {
          readExpiresAt: "2026-08-25T12:00:20.000Z",
          posterExpiresAt: null,
        },
        NOW_MS,
      ),
    ).toBe(0);
  });
});

describe("shouldRefreshEventMediaReadUrl", () => {
  it("is false while there is still time before the lead window", () => {
    expect(
      shouldRefreshEventMediaReadUrl(
        {
          readExpiresAt: "2026-08-25T12:05:00.000Z",
          posterExpiresAt: null,
        },
        NOW_MS,
      ),
    ).toBe(false);
  });

  it("is true once the lead window starts", () => {
    expect(
      shouldRefreshEventMediaReadUrl(
        {
          readExpiresAt: "2026-08-25T12:00:30.000Z",
          posterExpiresAt: null,
        },
        NOW_MS,
      ),
    ).toBe(true);
  });
});
