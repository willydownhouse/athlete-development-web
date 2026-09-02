import { describe, expect, it } from "vitest";

import { displayedChatMessages, mergeMessages } from "./chat-display";
import type { ChatMessage, ChatTurn } from "./types";

function message(
  input: Partial<ChatMessage> & Pick<ChatMessage, "id" | "role" | "content">,
): ChatMessage {
  return {
    chatThreadId: "thread-1",
    clientRequestId: null,
    createdAt: "2026-09-02T12:00:00.000Z",
    ...input,
  };
}

function turn(input: { id: string; user: ChatMessage; assistant?: ChatMessage | null }): ChatTurn {
  return {
    id: input.id,
    chatThreadId: "thread-1",
    status: "completed",
    failureCode: null,
    failureMessage: null,
    createdAt: "2026-09-02T12:00:00.000Z",
    updatedAt: "2026-09-02T12:00:01.000Z",
    completedAt: "2026-09-02T12:00:01.000Z",
    userMessage: input.user,
    assistantMessage: input.assistant ?? null,
    toolCalls: [],
  };
}

describe("displayedChatMessages", () => {
  it("shows the optimistic user message while a send is in flight", () => {
    const displayed = displayedChatMessages({
      messages: [],
      pending: {
        content: "Lisa had ice practice",
        clientRequestId: "req-1",
        threadId: "thread-1",
        createdAt: "2026-09-02T12:00:00.000Z",
      },
    });

    expect(displayed.map((item) => item.content)).toEqual(["Lisa had ice practice"]);
    expect(displayed[0]?.id).toBe("pending-req-1");
  });

  it("does not append the optimistic user message after the turn arrives", () => {
    const user = message({
      id: "user-1",
      role: "user",
      content: "Lisa had ice practice",
      clientRequestId: "req-1",
    });
    const assistant = message({
      id: "asst-1",
      role: "assistant",
      content: "Logged.",
    });

    const displayed = displayedChatMessages({
      messages: [],
      turn: turn({ id: "run-1", user, assistant }),
      pending: {
        content: "Lisa had ice practice",
        clientRequestId: "req-1",
        threadId: "thread-1",
        createdAt: "2026-09-02T12:00:00.000Z",
      },
    });

    expect(displayed.map((item) => ({ role: item.role, id: item.id }))).toEqual([
      { role: "user", id: "user-1" },
      { role: "assistant", id: "asst-1" },
    ]);
  });

  it("keeps earlier turns when a later send is still pending", () => {
    const firstUser = message({
      id: "user-1",
      role: "user",
      content: "First",
      clientRequestId: "req-1",
    });
    const firstAssistant = message({
      id: "asst-1",
      role: "assistant",
      content: "Logged first.",
    });

    const displayed = displayedChatMessages({
      messages: [firstUser, firstAssistant],
      turn: turn({ id: "run-1", user: firstUser, assistant: firstAssistant }),
      pending: {
        content: "Second",
        clientRequestId: "req-2",
        threadId: "thread-1",
        createdAt: "2026-09-02T12:01:00.000Z",
      },
    });

    expect(displayed.map((item) => item.content)).toEqual(["First", "Logged first.", "Second"]);
  });
});

describe("mergeMessages", () => {
  it("skips a later copy with the same clientRequestId", () => {
    const first = message({
      id: "user-1",
      role: "user",
      content: "Hello",
      clientRequestId: "req-1",
    });
    const duplicate = message({
      id: "pending-req-1",
      role: "user",
      content: "Hello",
      clientRequestId: "req-1",
    });

    expect(mergeMessages([first], [duplicate])).toEqual([first]);
  });
});
