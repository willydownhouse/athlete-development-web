"use client";

import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";

export function ChatWaitingBubble() {
  const messages = getMessages(useAppLocale());

  return (
    <div className="flex justify-start" aria-live="polite">
      <div
        className="inline-flex max-w-[85%] items-center gap-1.5 py-3"
        role="status"
        aria-label={messages.chat.thinking}
      >
        <span
          className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-[#9ec9e8]"
          aria-hidden="true"
        />
        <span
          className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-[#9ec9e8]"
          aria-hidden="true"
        />
        <span
          className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-[#9ec9e8]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
