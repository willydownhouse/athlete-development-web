import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createChatThread,
  createEventsBatch,
  fetchAllEvents,
  fetchAthletes,
  fetchCurrentAppUser,
  fetchEventTypes,
  fetchLatestChatMessages,
  fetchOlderChatMessages,
  fetchSports,
  getApiBaseUrl,
  submitChatMessage,
} from "./api";

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
        imageUrl: "https://lh3.googleusercontent.com/a/parent",
        role: "user",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const appUser = await fetchCurrentAppUser("test-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://api.test/api/auth/me");
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("no-store");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-token");
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

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://api.test/api/athletes?limit=100");
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("no-store");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-token");
    expect(athletes).toHaveLength(1);
    expect(athletes[0]?.name).toBe("Leo Laine");
  });

  it("fetches public sports", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "55555555-5555-4555-8555-555555555555",
            slug: "hockey",
            name: "Hockey",
            active: true,
            createdAt: "2026-07-25T12:00:00.000Z",
            updatedAt: "2026-07-25T12:00:00.000Z",
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const sports = await fetchSports();

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/sports", {
      cache: "no-store",
    });
    expect(sports).not.toBeNull();
    expect(sports).toHaveLength(1);
    expect(sports?.[0]?.slug).toBe("hockey");
  });

  it("returns null when sports fetch fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSports()).resolves.toBeNull();
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
      next: {
        revalidate: 3600,
        tags: ["event-types"],
      },
    });
    expect(eventTypes).toHaveLength(1);
    expect(eventTypes[0]?.name).toBe("Ice practice");
  });

  it("fetches all events in a range across paginated responses", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: Array.from({ length: 100 }, (_, index) => ({ id: `event-${index + 1}` })),
          pagination: { limit: 100, offset: 0, total: 101 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{ id: "event-101" }],
          pagination: { limit: 100, offset: 100, total: 101 },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const events = await fetchAllEvents("test-token", athleteId, {
      startedAtFrom: "2026-08-01T00:00:00.000Z",
      startedAtTo: "2026-09-01T00:00:00.000Z",
      include: "metrics",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/events?limit=100&offset=0&startedAtFrom=2026-08-01T00%3A00%3A00.000Z&startedAtTo=2026-09-01T00%3A00%3A00.000Z&include=metrics`,
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/events?limit=100&offset=100&startedAtFrom=2026-08-01T00%3A00%3A00.000Z&startedAtTo=2026-09-01T00%3A00%3A00.000Z&include=metrics`,
    );
    expect(events).toHaveLength(101);
  });

  it("creates events in batch", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ id: "event-1" }, { id: "event-2" }],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await createEventsBatch("test-token", athleteId, {
      events: [
        {
          eventTypeId: "33333333-3333-4333-8333-333333333333",
          startedAt: "2026-08-15T08:00:00.000Z",
          source: "form",
        },
        {
          eventTypeId: "33333333-3333-4333-8333-333333333333",
          startedAt: "2026-08-15T18:00:00.000Z",
          source: "form",
        },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/events/batch`,
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(options.cache).toBe("no-store");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-token");
    expect(JSON.parse(String(options.body))).toEqual({
      events: [
        {
          eventTypeId: "33333333-3333-4333-8333-333333333333",
          startedAt: "2026-08-15T08:00:00.000Z",
          source: "form",
        },
        {
          eventTypeId: "33333333-3333-4333-8333-333333333333",
          startedAt: "2026-08-15T18:00:00.000Z",
          source: "form",
        },
      ],
    });
    expect(result.items).toHaveLength(2);
  });

  it("creates the current chat thread", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        type: "event_logging",
        createdAt: "2026-09-01T12:00:00.000Z",
        updatedAt: "2026-09-01T12:00:00.000Z",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const thread = await createChatThread("test-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://api.test/api/chat/threads");
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(options.cache).toBe("no-store");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-token");
    expect(thread.type).toBe("event_logging");
  });

  it("fetches chat messages", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const threadId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ id: "msg-1" }],
        pagination: { limit: 20, total: 1, hasMore: false },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLatestChatMessages("test-token", threadId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/chat/threads/${threadId}/messages?limit=20`,
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("force-cache");
    expect(options.next).toEqual({
      tags: [`chat-messages-${threadId}`],
    });
    expect(result.items[0]?.id).toBe("msg-1");
  });

  it("fetches older chat messages with a before cursor", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const threadId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const before = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ id: "msg-0" }],
        pagination: { limit: 20, total: 21, hasMore: false },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchOlderChatMessages("test-token", threadId, before);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/chat/threads/${threadId}/messages?limit=20&before=${before}`,
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("no-store");
    expect(result.items[0]?.id).toBe("msg-0");
  });

  it("submits a chat message with timezone", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const threadId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: "run-1",
        chatThreadId: threadId,
        status: "completed",
        failureCode: null,
        failureMessage: null,
        userMessage: { id: "msg-1", role: "user", content: "Lisa has ice practice." },
        assistantMessage: { id: "msg-2", role: "assistant", content: "Logged." },
        toolCalls: [],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const body = {
      content: "Lisa has ice practice.",
      clientRequestId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      timeZone: "Europe/Helsinki",
    };
    const turn = await submitChatMessage("test-token", threadId, body);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/chat/threads/${threadId}/messages`,
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(JSON.parse(String(options.body))).toEqual(body);
    expect(turn.status).toBe("completed");
  });

  it("throws when the API responds with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => {
          throw new Error("no body");
        },
      }),
    );

    await expect(fetchCurrentAppUser("bad-token")).rejects.toThrow(
      "API request failed with status 401",
    );
  });
});
