"use client";

import { useActionState } from "react";

import { sendChatMessageAction } from "@/app/chat/actions";
import { FormMessage } from "@/components/admin/form-message";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { ChatTypewriterContent } from "@/components/chat/chat-typewriter-content";
import { ChatWaitingBubble } from "@/components/chat/chat-waiting-bubble";
import { useIncomingAssistantTypewriter } from "@/hooks/use-chat-typewriter";
import { chatEventUpdateExample } from "@/lib/chat-intro";

type EventTobyDockProps = {
  threadId: string | null;
  athleteId: string;
  eventId: string;
  loadError?: string | null;
};

export function EventTobyDock({ threadId, athleteId, eventId, loadError }: EventTobyDockProps) {
  const [state, formAction, isPending] = useActionState(sendChatMessageAction, {});
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

  return (
    <div className="border-t border-white/5 bg-[#0b0d10] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-md lg:max-w-3xl">
        <label
          htmlFor="event-toby-message"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Tell Toby what to change
        </label>

        {loadError ? (
          <p className="mb-3 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        {isPending ? (
          <div className="mb-3">
            <ChatWaitingBubble />
          </div>
        ) : null}

        {!isPending && assistantContent ? (
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
