"use client";

import { useActionState, useMemo, useRef, useState } from "react";

import { loadFocusedEventChatMessagesAction, sendChatMessageAction } from "@/app/chat/actions";
import { FormMessage } from "@/components/admin/form-message";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { ChatTypewriterContent } from "@/components/chat/chat-typewriter-content";
import { ChatWaitingBubble } from "@/components/chat/chat-waiting-bubble";
import { EventTobyHistory } from "@/components/chat/event-toby-history";
import { useIncomingAssistantTypewriter } from "@/hooks/use-chat-typewriter";
import { chatEventUpdateExample } from "@/lib/chat-intro";
import { mergeMessages } from "@/lib/chat-display";
import type { ChatMessage } from "@/lib/types";

type EventTobyDockProps = {
  threadId: string | null;
  athleteId: string;
  eventId: string;
  loadError?: string | null;
};

export function EventTobyDock({ threadId, athleteId, eventId, loadError }: EventTobyDockProps) {
  const [state, formAction, isPending] = useActionState(sendChatMessageAction, {});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadingOlder, setHistoryLoadingOlder] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const loadingOlderRef = useRef(false);
  const composerKey = state.turn?.id ?? "draft";
  const assistantMessage = state.turn?.assistantMessage ?? null;
  const assistantContent = assistantMessage?.content ?? null;
  const typewriterMessageId = useIncomingAssistantTypewriter(
    isPending,
    assistantMessage?.id ?? null,
  );
  const animateReply = Boolean(
    assistantContent && assistantMessage && assistantMessage.id === typewriterMessageId,
  );
  const showLatestReply = !historyOpen && !isPending && Boolean(assistantContent);
  const displayedHistoryMessages = useMemo(() => {
    const turn = state.turn;
    if (!historyLoaded || !turn) {
      return historyMessages;
    }

    return mergeMessages(historyMessages, [
      turn.userMessage,
      ...(turn.assistantMessage ? [turn.assistantMessage] : []),
    ]);
  }, [historyLoaded, historyMessages, state.turn]);

  async function loadHistory(before?: string) {
    if (!threadId) {
      return;
    }

    if (before) {
      if (!historyHasMore || loadingOlderRef.current) {
        return;
      }

      loadingOlderRef.current = true;
      setHistoryLoadingOlder(true);
    } else {
      setHistoryLoading(true);
    }
    setHistoryError(null);

    const result = await loadFocusedEventChatMessagesAction(threadId, eventId, before);

    if (result.error || !result.items) {
      setHistoryError(result.error ?? "Could not load earlier updates");
      loadingOlderRef.current = false;
      setHistoryLoading(false);
      setHistoryLoadingOlder(false);
      return;
    }

    setHistoryMessages((current) =>
      before ? mergeMessages(result.items ?? [], current) : (result.items ?? []),
    );
    setHistoryHasMore(result.hasMore ?? false);
    setHistoryLoaded(true);
    loadingOlderRef.current = false;
    setHistoryLoading(false);
    setHistoryLoadingOlder(false);
  }

  async function toggleHistory() {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }

    setHistoryOpen(true);
    if (!historyLoaded && !historyLoading) {
      await loadHistory();
    }
  }

  return (
    <div className="border-t border-white/5 bg-[#0b0d10] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-md lg:max-w-3xl">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="event-toby-message" className="text-sm font-medium text-zinc-300">
            Tell Toby what to change
          </label>
          {threadId ? (
            <button
              type="button"
              onClick={() => {
                void toggleHistory();
              }}
              aria-expanded={historyOpen}
              className="shrink-0 text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              {historyOpen ? "Hide" : "Earlier updates"}
            </button>
          ) : null}
        </div>

        {loadError ? (
          <p className="mb-3 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        {historyOpen ? (
          <EventTobyHistory
            messages={displayedHistoryMessages}
            hasMore={historyHasMore}
            loading={historyLoading}
            loadingOlder={historyLoadingOlder}
            error={historyError}
            onLoadOlder={() => {
              const before = historyMessages[0]?.id;
              if (historyHasMore && before) {
                void loadHistory(before);
              }
            }}
          />
        ) : null}

        {isPending ? (
          <div className="mb-3">
            <ChatWaitingBubble />
          </div>
        ) : null}

        {showLatestReply && assistantContent ? (
          <div
            className="mb-3 max-h-[min(8rem,22dvh)] overflow-y-auto overscroll-contain"
            aria-live="polite"
          >
            {animateReply && assistantMessage ? (
              <ChatTypewriterContent key={assistantMessage.id} content={assistantContent} />
            ) : (
              <ChatMarkdown content={assistantContent} />
            )}
          </div>
        ) : null}

        {state.error ? (
          <div className="mb-3">
            <FormMessage error={state.error} />
          </div>
        ) : null}

        {threadId ? (
          <ChatComposer
            key={composerKey}
            threadId={threadId}
            eventId={eventId}
            athleteId={athleteId}
            messageFieldId="event-toby-message"
            hideFieldLabel
            formAction={formAction}
            isPending={isPending}
            formClassName="shrink-0"
            examplePlaceholder={chatEventUpdateExample()}
          />
        ) : (
          <p className="text-sm text-zinc-500">Toby is unavailable until chat loads.</p>
        )}
      </div>
    </div>
  );
}
