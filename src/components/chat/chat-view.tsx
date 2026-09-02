"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadOlderChatMessagesAction, sendChatMessageAction } from "@/app/chat/actions";
import { FormMessage } from "@/components/admin/form-message";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList, ChatMessageListSkeleton } from "@/components/chat/chat-message-list";
import { CHAT_NAV_LABEL } from "@/components/dashboard/dashboard-nav";
import { displayedChatMessages, mergeMessages } from "@/lib/chat-display";
import type { ChatMessage } from "@/lib/types";

type ChatViewProps = {
  threadId: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
  timeZone: string;
  nowIso: string;
  canSend?: boolean;
  loadError?: string | null;
};

const LOAD_OLDER_THRESHOLD_PX = 80;

function ChatNeedsAthleteState() {
  return (
    <div className="flex flex-1 flex-col justify-center py-6">
      <h2 className="text-lg font-semibold tracking-tight text-white">Add an athlete first</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-300">
        Event Agent logs practices, games, and rest for an athlete. Add one to start.
      </p>
      <Link
        href="/onboarding"
        className="mt-6 inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0]"
      >
        Add athlete
      </Link>
    </div>
  );
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
  canSend = true,
  loadError,
}: ChatViewProps) {
  const [state, formAction, isPending] = useActionState(sendChatMessageAction, {});
  const [messages, setMessages] = useState(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [listReady, setListReady] = useState(initialMessages.length === 0);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);
  const loadingOlderRef = useRef(false);
  const wasPending = useRef(false);
  const seededThreadId = useRef(threadId);
  const pending =
    pendingContent !== null && pendingRequestId !== null && isPending
      ? {
          content: pendingContent,
          clientRequestId: pendingRequestId,
          threadId: threadId ?? "",
          createdAt: nowIso,
        }
      : null;

  const displayedMessages = useMemo(
    () => displayedChatMessages({ messages, turn: state.turn, pending }),
    [messages, pending, state.turn],
  );

  useEffect(() => {
    if (threadId === seededThreadId.current) {
      return;
    }

    seededThreadId.current = threadId;
    setMessages(initialMessages);
    setHasMore(initialHasMore);
    didInitialScroll.current = false;
    setListReady(initialMessages.length === 0);
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
      setListReady(true);
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
    if (!listReady || !list || !hasMore || loadingOlder || messages.length === 0) {
      return;
    }

    if (list.scrollHeight <= list.clientHeight + LOAD_OLDER_THRESHOLD_PX) {
      void loadOlder();
    }
  }, [hasMore, listReady, loadOlder, loadingOlder, messages.length]);

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
      <h1 className="sr-only">{CHAT_NAV_LABEL}</h1>

      {loadError ? (
        <p className="mb-4 shrink-0 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          className={`absolute inset-0 flex flex-col pb-4 ${
            listReady ? "overflow-y-auto" : "overflow-hidden"
          }`}
          onScroll={handleListScroll}
          aria-busy={!listReady}
          aria-hidden={!listReady}
        >
          {loadingOlder ? (
            <div className="sticky top-0 z-10 mb-3 flex justify-center pt-1" aria-live="polite">
              <div className="inline-flex items-center gap-2.5 rounded-2xl border border-white/5 bg-[#171b22] px-4 py-2">
                <span
                  className="inline-flex h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-600 border-t-[#9ec9e8]"
                  aria-hidden="true"
                />
                <p className="text-sm text-zinc-400">Loading earlier messages…</p>
              </div>
            </div>
          ) : null}
          {olderError ? (
            <p className="mb-3 text-center text-xs text-red-300">{olderError}</p>
          ) : null}
          {showEmpty ? (
            canSend ? (
              <ChatEmptyState />
            ) : (
              <ChatNeedsAthleteState />
            )
          ) : (
            <ChatMessageList
              messages={displayedMessages}
              timeZone={timeZone}
              nowIso={nowIso}
              waiting={isPending}
            />
          )}
        </div>
        {!listReady ? (
          <div className="absolute inset-0 overflow-hidden bg-[#0b0d10]">
            <ChatMessageListSkeleton />
          </div>
        ) : null}
      </div>

      {state.error ? (
        <div className="shrink-0 pb-3">
          <FormMessage error={state.error} />
        </div>
      ) : null}

      {!threadId ? (
        <p className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-zinc-500">
          Chat is unavailable until the thread loads.
        </p>
      ) : canSend ? (
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
      ) : showEmpty ? null : (
        <p className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-zinc-500">
          Add an athlete to keep logging.{" "}
          <Link href="/onboarding" className="text-[#9ec9e8] transition hover:text-[#c5dff0]">
            Add athlete
          </Link>
        </p>
      )}
    </div>
  );
}
