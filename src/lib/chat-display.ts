import type { ChatMessage, ChatRun } from "@/lib/types";

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
  run?: ChatRun;
  pending?: {
    content: string;
    clientRequestId: string;
    threadId: string;
    createdAt: string;
  } | null;
}): ChatMessage[] {
  const fromRun = input.run
    ? [input.run.userMessage, ...(input.run.assistantMessage ? [input.run.assistantMessage] : [])]
    : [];
  const withRun = mergeMessages(input.messages, fromRun);
  const pending = input.pending;

  if (!pending) {
    return withRun;
  }

  if (withRun.some((message) => message.clientRequestId === pending.clientRequestId)) {
    return withRun;
  }

  const optimistic: ChatMessage = {
    id: `pending-${pending.clientRequestId}`,
    chatThreadId: pending.threadId,
    role: "user",
    content: pending.content,
    clientRequestId: pending.clientRequestId,
    createdAt: pending.createdAt,
  };

  return [...withRun, optimistic];
}
