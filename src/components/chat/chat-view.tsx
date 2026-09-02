"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadOlderChatMessagesAction, sendChatMessageAction } from "@/app/chat/actions";
import { FormMessage } from "@/components/admin/form-message";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import type { ChatMessage } from "@/lib/types";

type ChatViewProps = {
  threadId: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
  timeZone: string;
  nowIso: string;
  loadError?: string | null;
};

const LOAD_OLDER_THRESHOLD_PX = 80;

function mergeMessages(earlier: ChatMessage[], later: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  const merged: ChatMessage[] = [];

  for (const message of [...earlier, ...later]) {
    if (seen.has(message.id)) {
      continue;
    }

    seen.add(message.id);
    merged.push(message);
  }

  return merged;
}

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

export function ChatView({
  threadId,
  messages: initialMessages,
  hasMore: initialHasMore,
  timeZone,
  nowIso,
  loadError,
}: ChatViewProps) {
  const [state, formAction, isPending] = useActionState(sendChatMessageAction, {});
  const [messages, setMessages] = useState(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);
  const loadingOlderRef = useRef(false);
  const wasPending = useRef(false);
  const seededThreadId = useRef(threadId);
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
    const fromTurn = state.turn
      ? [
          state.turn.userMessage,
          ...(state.turn.assistantMessage ? [state.turn.assistantMessage] : []),
        ]
      : [];
    const withTurn = mergeMessages(messages, fromTurn);

    if (!showOptimistic) {
      return withTurn;
    }

    const optimistic: ChatMessage = {
      id: `pending-${pendingRequestId}`,
      chatThreadId: threadId ?? "",
      role: "user",
      content: pendingContent,
      clientRequestId: pendingRequestId,
      createdAt: nowIso,
    };

    return [...withTurn, optimistic];
  }, [messages, showOptimistic, pendingContent, pendingRequestId, threadId, nowIso, state.turn]);

  useEffect(() => {
    if (threadId === seededThreadId.current) {
      return;
    }

    seededThreadId.current = threadId;
    setMessages(initialMessages);
    setHasMore(initialHasMore);
    didInitialScroll.current = false;
  }, [threadId, initialMessages, initialHasMore]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    if (!didInitialScroll.current) {
      list.scrollTop = list.scrollHeight;
      didInitialScroll.current = true;
      wasPending.current = isPending;
      return;
    }

    if (isPending || wasPending.current) {
      list.scrollTop = list.scrollHeight;
    }

    wasPending.current = isPending;
  }, [displayedMessages, isPending]);

  const loadOlder = useCallback(async () => {
    const beforeId = messages[0]?.id;
    if (!threadId || !hasMore || loadingOlderRef.current || messages.length === 0 || !beforeId) {
      return;
    }

    const list = listRef.current;
    const previousHeight = list?.scrollHeight ?? 0;
    const previousTop = list?.scrollTop ?? 0;

    loadingOlderRef.current = true;
    setLoadingOlder(true);
    setOlderError(null);

    const result = await loadOlderChatMessagesAction(threadId, beforeId);

    if (result.error || !result.items) {
      setOlderError(result.error ?? "Could not load older messages");
      loadingOlderRef.current = false;
      setLoadingOlder(false);
      return;
    }

    setMessages((current) => mergeMessages(result.items ?? [], current));
    setHasMore(result.hasMore ?? false);
    setLoadingOlder(false);
    loadingOlderRef.current = false;

    requestAnimationFrame(() => {
      if (!list) {
        return;
      }

      list.scrollTop = previousTop + (list.scrollHeight - previousHeight);
    });
  }, [hasMore, messages, threadId]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !hasMore || loadingOlder || messages.length === 0) {
      return;
    }

    if (list.scrollHeight <= list.clientHeight + LOAD_OLDER_THRESHOLD_PX) {
      void loadOlder();
    }
  }, [hasMore, loadOlder, loadingOlder, messages.length]);

  function handleListScroll() {
    const list = listRef.current;
    if (!list || list.scrollTop > LOAD_OLDER_THRESHOLD_PX) {
      return;
    }

    void loadOlder();
  }

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

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4"
        onScroll={handleListScroll}
      >
        {loadingOlder ? (
          <p className="mb-3 text-center text-xs text-zinc-500" aria-live="polite">
            Loading earlier messages…
          </p>
        ) : null}
        {olderError ? <p className="mb-3 text-center text-xs text-red-300">{olderError}</p> : null}
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
            const turn = state.turn;
            if (turn) {
              const next = [turn.userMessage];
              if (turn.assistantMessage) {
                next.push(turn.assistantMessage);
              }
              setMessages((current) => mergeMessages(current, next));
            }

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
