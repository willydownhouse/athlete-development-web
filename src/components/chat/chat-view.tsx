"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { sendChatMessageAction } from "@/app/chat/actions";
import { FormMessage } from "@/components/admin/form-message";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import type { ChatMessage } from "@/lib/types";

type ChatViewProps = {
  threadId: string | null;
  messages: ChatMessage[];
  timeZone: string;
  nowIso: string;
  loadError?: string | null;
};

function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col justify-center py-6">
      <h2 className="text-lg font-semibold tracking-tight text-white">Nothing logged yet</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-300">
        Describe a practice, game, or rest. Name the athlete if you have more than one.
      </p>
    </div>
  );
}

export function ChatView({ threadId, messages, timeZone, nowIso, loadError }: ChatViewProps) {
  const [state, formAction, isPending] = useActionState(sendChatMessageAction, {});
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const savedPending = Boolean(
    pendingRequestId && messages.some((message) => message.clientRequestId === pendingRequestId),
  );
  const failedWithoutSave = Boolean(state.error && !state.turn && !isPending);
  const showOptimistic =
    pendingContent !== null &&
    pendingRequestId !== null &&
    !savedPending &&
    !failedWithoutSave &&
    (isPending || Boolean(state.turn));

  const displayedMessages = useMemo(() => {
    if (!showOptimistic) {
      return messages;
    }

    const optimistic: ChatMessage = {
      id: `pending-${pendingRequestId}`,
      chatThreadId: threadId ?? "",
      role: "user",
      content: pendingContent,
      clientRequestId: pendingRequestId,
      createdAt: nowIso,
    };

    return [...messages, optimistic];
  }, [messages, showOptimistic, pendingContent, pendingRequestId, threadId, nowIso]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [displayedMessages, isPending]);

  const showEmpty = displayedMessages.length === 0 && !isPending && !loadError;
  const composerKey = state.turn?.id ?? "draft";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 pb-4">
        <p className="text-sm text-zinc-400">Chat</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Event log</h1>
      </header>

      {loadError ? (
        <p className="mb-4 shrink-0 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <div ref={listRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
        {showEmpty ? (
          <ChatEmptyState />
        ) : (
          <ChatMessageList
            messages={displayedMessages}
            timeZone={timeZone}
            nowIso={nowIso}
            waiting={isPending}
          />
        )}
      </div>

      {state.error ? (
        <div className="shrink-0 pb-3">
          <FormMessage error={state.error} />
        </div>
      ) : null}

      {threadId ? (
        <ChatComposer
          key={composerKey}
          threadId={threadId}
          formAction={formAction}
          isPending={isPending}
          onSend={({ content, clientRequestId }) => {
            setPendingContent(content);
            setPendingRequestId(clientRequestId);
          }}
        />
      ) : (
        <div className="shrink-0 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-sm text-zinc-500">Chat is unavailable until the thread loads.</p>
        </div>
      )}
    </div>
  );
}
