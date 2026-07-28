import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminApiError, listAdminSports } from "./admin-api";

describe("admin api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lists sports with bearer auth", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            slug: "hockey",
            name: "Hockey",
            active: true,
            createdAt: "2026-07-28T12:00:00.000Z",
            updatedAt: "2026-07-28T12:00:00.000Z",
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const sports = await listAdminSports("admin-token");

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/admin/sports", {
      headers: expect.any(Headers),
      cache: "no-store",
    });

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(sports).toHaveLength(1);
    expect(sports[0]?.slug).toBe("hockey");
  });

  it("throws AdminApiError with API message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: "Slug already exists" }),
      }),
    );

    await expect(listAdminSports("token")).rejects.toMatchObject({
      name: "AdminApiError",
      status: 409,
      apiError: "Slug already exists",
    } satisfies Partial<AdminApiError>);
  });
});
