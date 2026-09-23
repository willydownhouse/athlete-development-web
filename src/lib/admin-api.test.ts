import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AdminApiError,
  createAdminDemoAllowedEmail,
  createAdminSport,
  deleteAdminDemoAllowedEmail,
  listAdminDemoAllowedEmails,
  listAdminSports,
} from "./admin-api";

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

  it("creates a sport with Finnish translations", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const created = {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "floorball",
      name: "Floorball",
      active: true,
      createdAt: "2026-07-28T12:00:00.000Z",
      updatedAt: "2026-07-28T12:00:00.000Z",
      translations: { fi: { name: "Salibandy" } },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => created,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createAdminSport("admin-token", {
        slug: "floorball",
        name: "Floorball",
        translations: { fi: { name: "Salibandy" } },
      }),
    ).resolves.toEqual(created);

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/admin/sports", {
      method: "POST",
      body: JSON.stringify({
        slug: "floorball",
        name: "Floorball",
        translations: { fi: { name: "Salibandy" } },
      }),
      headers: expect.any(Headers),
      cache: "no-store",
    });
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

  it("lists demo allowed emails with the gate flag", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        enabled: true,
        items: [
          {
            id: "22222222-2222-4222-8222-222222222222",
            email: "parent@example.com",
            createdAt: "2026-09-21T12:00:00.000Z",
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await listAdminDemoAllowedEmails("admin-token");

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/admin/demo-allowed-emails", {
      headers: expect.any(Headers),
      cache: "no-store",
    });
    expect(result.enabled).toBe(true);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.email).toBe("parent@example.com");
  });

  it("creates a demo allowed email", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const created = {
      id: "33333333-3333-4333-8333-333333333333",
      email: "parent@example.com",
      createdAt: "2026-09-21T12:00:00.000Z",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => created,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createAdminDemoAllowedEmail("admin-token", { email: "Parent@example.com" }),
    ).resolves.toEqual(created);

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/admin/demo-allowed-emails", {
      method: "POST",
      body: JSON.stringify({ email: "Parent@example.com" }),
      headers: expect.any(Headers),
      cache: "no-store",
    });
  });

  it("deletes a demo allowed email", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteAdminDemoAllowedEmail("admin-token", "33333333-3333-4333-8333-333333333333"),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/admin/demo-allowed-emails/33333333-3333-4333-8333-333333333333",
      {
        method: "DELETE",
        headers: expect.any(Headers),
        cache: "no-store",
      },
    );
  });
});
