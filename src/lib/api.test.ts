import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchAthletes, fetchCurrentAppUser, fetchEventTypes, getApiBaseUrl } from "./api";

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the configured API base URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    expect(getApiBaseUrl()).toBe("http://api.test");
  });

  it("fetches the current app user with a bearer token", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "11111111-1111-4111-8111-111111111111",
        email: "parent@example.com",
        name: "Parent User",
        role: "owner",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const appUser = await fetchCurrentAppUser("test-token");

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/auth/me", {
      headers: {
        Authorization: "Bearer test-token",
      },
      cache: "no-store",
    });
    expect(appUser.email).toBe("parent@example.com");
  });

  it("fetches athletes for the logged-in user", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Leo Laine",
          },
        ],
        pagination: { limit: 100, offset: 0, total: 1 },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const athletes = await fetchAthletes("test-token");

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/athletes?limit=100", {
      headers: {
        Authorization: "Bearer test-token",
      },
      cache: "no-store",
    });
    expect(athletes).toHaveLength(1);
    expect(athletes[0]?.name).toBe("Leo Laine");
  });

  it("fetches public event types, optionally filtered by sport", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            name: "Ice practice",
            slug: "ice_practice",
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const sportId = "44444444-4444-4444-8444-444444444444";
    const eventTypes = await fetchEventTypes(sportId);

    expect(fetchMock).toHaveBeenCalledWith(`http://api.test/api/event-types?sportId=${sportId}`, {
      cache: "no-store",
    });
    expect(eventTypes).toHaveLength(1);
    expect(eventTypes[0]?.name).toBe("Ice practice");
  });

  it("throws when the API responds with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    await expect(fetchCurrentAppUser("bad-token")).rejects.toThrow(
      "API request failed with status 401",
    );
  });
});
