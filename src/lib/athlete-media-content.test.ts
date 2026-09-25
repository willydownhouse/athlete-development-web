import { describe, expect, it } from "vitest";

import {
  athleteMediaAvatarUrl,
  athleteMediaContentResponseHeaders,
  athleteMediaContentUpstreamPath,
  isAthleteMediaRouteId,
} from "./athlete-media-content";

describe("athlete media content proxy helpers", () => {
  it("builds the Fastify content path", () => {
    expect(
      athleteMediaContentUpstreamPath(
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
      ),
    ).toBe(
      "/api/athletes/11111111-1111-4111-8111-111111111111/media/22222222-2222-4222-8222-222222222222/content",
    );
  });

  it("forwards the content variant query", () => {
    expect(
      athleteMediaContentUpstreamPath(
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
        new URLSearchParams("variant=avatar"),
      ),
    ).toBe(
      "/api/athletes/11111111-1111-4111-8111-111111111111/media/22222222-2222-4222-8222-222222222222/content?variant=avatar",
    );
  });

  it("appends variant=avatar to a content path", () => {
    expect(
      athleteMediaAvatarUrl(
        "/api/athletes/11111111-1111-4111-8111-111111111111/media/22222222-2222-4222-8222-222222222222/content",
      ),
    ).toBe(
      "/api/athletes/11111111-1111-4111-8111-111111111111/media/22222222-2222-4222-8222-222222222222/content?variant=avatar",
    );
  });

  it("ignores unrelated query parameters", () => {
    expect(
      athleteMediaContentUpstreamPath(
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
        new URLSearchParams("foo=1"),
      ),
    ).toBe(
      "/api/athletes/11111111-1111-4111-8111-111111111111/media/22222222-2222-4222-8222-222222222222/content",
    );
  });

  it("accepts route UUIDs and rejects junk", () => {
    expect(isAthleteMediaRouteId("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isAthleteMediaRouteId("not-a-uuid")).toBe(false);
  });

  it("copies cache headers from the upstream response", () => {
    const headers = athleteMediaContentResponseHeaders(
      new Headers({
        "Content-Type": "image/webp",
        "Cache-Control": "private, max-age=31536000, immutable",
        ETag: '"abc"',
        "Content-Length": "512",
      }),
    );

    expect(headers.get("Content-Type")).toBe("image/webp");
    expect(headers.get("Cache-Control")).toBe("private, max-age=31536000, immutable");
    expect(headers.get("ETag")).toBe('"abc"');
    expect(headers.get("Content-Length")).toBe("512");
  });
});
