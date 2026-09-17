import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createChatThread,
  createEventsBatch,
  fetchAllEvents,
  fetchAthletes,
  fetchCurrentAppUser,
  fetchEventTypes,
  fetchEventTypesMetricDefinitions,
  fetchEventAggregate,
  fetchEventItemAggregate,
  fetchEventItemTypes,
  fetchEvents,
  fetchFocusedEventChatMessages,
  fetchLatestChatMessages,
  fetchMonthlyUsage,
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

  it("fetches monthly usage with a bearer token", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        periodStart: "2026-09-01T00:00:00.000Z",
        periodEnd: "2026-10-01T00:00:00.000Z",
        limitReached: false,
        inputTokens: { used: 50, limit: 500000, remaining: 499950 },
        outputTokens: { used: 7, limit: 30000, remaining: 29993 },
        features: [
          {
            feature: "event_logging",
            inputTokens: 50,
            outputTokens: 7,
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const usage = await fetchMonthlyUsage("test-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://api.test/api/usage");
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("no-store");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-token");
    expect(usage.inputTokens.used).toBe(50);
    expect(usage.features[0]?.feature).toBe("event_logging");
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

  it("fetches event type metric mappings for a sport", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "55555555-5555-4555-8555-555555555555",
            eventTypeId: "33333333-3333-4333-8333-333333333333",
            metricDefinitionId: "66666666-6666-4666-8666-666666666666",
            required: false,
            sortOrder: 10,
            metricDefinition: {
              id: "66666666-6666-4666-8666-666666666666",
              key: "shot_count",
              name: "Shot count",
              valueType: "number",
            },
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const sportId = "44444444-4444-4444-8444-444444444444";
    const mappings = await fetchEventTypesMetricDefinitions(sportId);

    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.test/api/event-types/metric-definitions?sportId=${sportId}`,
      {
        next: {
          revalidate: 3600,
          tags: ["event-types"],
        },
      },
    );
    expect(mappings).toHaveLength(1);
    expect(mappings[0]?.metricDefinition.key).toBe("shot_count");
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

  it("fetches events with repeated event type ids", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [],
        pagination: { limit: 10, offset: 0, total: 0 },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await fetchEvents("test-token", athleteId, {
      limit: 10,
      offset: 0,
      eventTypeIds: [
        "00000000-0000-4000-8000-000000000201",
        "00000000-0000-4000-8000-000000000209",
      ],
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/events?limit=10&offset=0&eventTypeIds=00000000-0000-4000-8000-000000000201&eventTypeIds=00000000-0000-4000-8000-000000000209`,
    );
  });

  it("fetches events with repeated categories", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [],
        pagination: { limit: 10, offset: 0, total: 0 },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await fetchEvents("test-token", athleteId, {
      limit: 10,
      offset: 0,
      categories: ["training", "competition"],
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/events?limit=10&offset=0&categories=training&categories=competition`,
    );
  });

  it("fetches an event aggregate with repeated filters", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        athleteId,
        aggregation: "metric",
        metricDefinitionId: "00000000-0000-4000-8000-000000000402",
        canonicalUnit: "goals",
        total: 4,
        matchingEventCount: 3,
        eventsWithValue: 2,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchEventAggregate("test-token", athleteId, {
      startedAtFrom: "2026-08-01T00:00:00.000Z",
      startedAtTo: "2026-09-01T00:00:00.000Z",
      aggregation: "metric",
      eventTypeIds: [
        "00000000-0000-4000-8000-000000000201",
        "00000000-0000-4000-8000-000000000209",
      ],
      categories: ["competition"],
      metricDefinitionId: "00000000-0000-4000-8000-000000000402",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/events/aggregate?startedAtFrom=2026-08-01T00%3A00%3A00.000Z&startedAtTo=2026-09-01T00%3A00%3A00.000Z&aggregation=metric&eventTypeIds=00000000-0000-4000-8000-000000000201&eventTypeIds=00000000-0000-4000-8000-000000000209&categories=competition&metricDefinitionId=00000000-0000-4000-8000-000000000402`,
    );
    expect(result.total).toBe(4);
    expect(result.eventsWithValue).toBe(2);
  });

  it("fetches public event item types, optionally filtered by sport", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "00000000-0000-4000-8000-000000000605",
            sportId: null,
            slug: "warm_up",
            name: "Warm-up",
            active: true,
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const sportId = "44444444-4444-4444-8444-444444444444";
    const itemTypes = await fetchEventItemTypes(sportId);

    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.test/api/event-item-types?sportId=${sportId}`,
      {
        next: {
          revalidate: 3600,
          tags: ["event-types"],
        },
      },
    );
    expect(itemTypes).toHaveLength(1);
    expect(itemTypes[0]?.slug).toBe("warm_up");
  });

  it("fetches an event item aggregate with repeated filters", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const eventItemTypeId = "00000000-0000-4000-8000-000000000605";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        athleteId,
        aggregation: "durationSeconds",
        eventItemTypeId,
        canonicalUnit: "s",
        total: 1080,
        matchingItemCount: 3,
        itemsWithValue: 2,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchEventItemAggregate("test-token", athleteId, {
      startedAtFrom: "2026-08-01T00:00:00.000Z",
      startedAtTo: "2026-09-01T00:00:00.000Z",
      eventItemTypeId,
      aggregation: "durationSeconds",
      eventTypeIds: [
        "00000000-0000-4000-8000-000000000201",
        "00000000-0000-4000-8000-000000000209",
      ],
      categories: ["training"],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/event-items/aggregate?startedAtFrom=2026-08-01T00%3A00%3A00.000Z&startedAtTo=2026-09-01T00%3A00%3A00.000Z&eventItemTypeId=${eventItemTypeId}&aggregation=durationSeconds&eventTypeIds=00000000-0000-4000-8000-000000000201&eventTypeIds=00000000-0000-4000-8000-000000000209&categories=training`,
    );
    expect(result.total).toBe(1080);
    expect(result.itemsWithValue).toBe(2);
  });

  it("fetches an event item aggregate with a label", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const athleteId = "22222222-2222-4222-8222-222222222222";
    const eventItemTypeId = "00000000-0000-4000-8000-000000000601";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        athleteId,
        aggregation: "count",
        eventItemTypeId,
        canonicalUnit: null,
        total: 2,
        matchingItemCount: 2,
        itemsWithValue: 2,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchEventItemAggregate("test-token", athleteId, {
      startedAtFrom: "2026-08-01T00:00:00.000Z",
      startedAtTo: "2026-09-01T00:00:00.000Z",
      eventItemTypeId,
      aggregation: "count",
      label: "Back squat",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/athletes/${athleteId}/event-items/aggregate?startedAtFrom=2026-08-01T00%3A00%3A00.000Z&startedAtTo=2026-09-01T00%3A00%3A00.000Z&eventItemTypeId=${eventItemTypeId}&aggregation=count&label=Back+squat`,
    );
    expect(result.total).toBe(2);
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
      `http://api.test/api/chat/threads/${threadId}/messages?limit=20&excludeFocused=true`,
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
      `http://api.test/api/chat/threads/${threadId}/messages?limit=20&excludeFocused=true&before=${before}`,
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("no-store");
    expect(result.items[0]?.id).toBe("msg-0");
  });

  it("fetches focused event chat messages", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const threadId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const focusedEventId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ id: "msg-focus" }],
        pagination: { limit: 20, total: 1, hasMore: false },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchFocusedEventChatMessages("test-token", threadId, focusedEventId);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://api.test/api/chat/threads/${threadId}/messages?limit=20&focusedEventId=${focusedEventId}`,
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(options.cache).toBe("no-store");
    expect(result.items[0]?.id).toBe("msg-focus");
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

  it("submits a focused event update message", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

    const threadId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const eventId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: "run-2",
        chatThreadId: threadId,
        status: "completed",
        failureCode: null,
        failureMessage: null,
        userMessage: { id: "msg-1", role: "user", content: "Move this to 6pm." },
        assistantMessage: { id: "msg-2", role: "assistant", content: "Moved it." },
        toolCalls: [],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const body = {
      content: "Move this to 6pm.",
      clientRequestId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      timeZone: "Europe/Helsinki",
      eventId,
    };
    await submitChatMessage("test-token", threadId, body);

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual(body);
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
