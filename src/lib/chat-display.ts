import type { ChatMessage, ChatTurn } from "@/lib/types";

export function mergeMessages(earlier: ChatMessage[], later: ChatMessage[]): ChatMessage[] {
  const seenIds = new Set<string>();
  const seenRequestIds = new Set<string>();
  const merged: ChatMessage[] = [];

  for (const message of [...earlier, ...later]) {
    if (seenIds.has(message.id)) {
      continue;
    }

    if (message.clientRequestId && seenRequestIds.has(message.clientRequestId)) {
      continue;
    }

    seenIds.add(message.id);
    if (message.clientRequestId) {
      seenRequestIds.add(message.clientRequestId);
    }

    merged.push(message);
  }

  return merged;
}

export function displayedChatMessages(input: {
  messages: ChatMessage[];
  turn?: ChatTurn;
  pending?: {
    content: string;
    clientRequestId: string;
    threadId: string;
    createdAt: string;
  } | null;
}): ChatMessage[] {
  const fromTurn = input.turn
    ? [
        input.turn.userMessage,
        ...(input.turn.assistantMessage ? [input.turn.assistantMessage] : []),
      ]
    : [];
  const withTurn = mergeMessages(input.messages, fromTurn);
  const pending = input.pending;

  if (!pending) {
    return withTurn;
  }

  if (withTurn.some((message) => message.clientRequestId === pending.clientRequestId)) {
    return withTurn;
  }

  const optimistic: ChatMessage = {
    id: `pending-${pending.clientRequestId}`,
    chatThreadId: pending.threadId,
    role: "user",
    content: pending.content,
    clientRequestId: pending.clientRequestId,
    createdAt: pending.createdAt,
  };

  return [...withTurn, optimistic];
}
