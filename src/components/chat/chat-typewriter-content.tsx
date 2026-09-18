"use client";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { useChatTypewriter } from "@/hooks/use-chat-typewriter";

export function ChatTypewriterContent({
  content,
  onTick,
}: {
  content: string;
  onTick?: () => void;
}) {
  const { visible, complete } = useChatTypewriter(content, onTick);

  return (
    <>
      <ChatMarkdown
        content={visible}
        hiddenFromAT={!complete}
        trailing={
          complete ? null : (
            <span
              className="ml-0.5 inline-block h-[1em] w-[0.12em] translate-y-0.5 animate-pulse bg-[#9ec9e8] align-text-bottom"
              aria-hidden="true"
            />
          )
        }
      />
      {complete ? null : <p className="sr-only">{content}</p>}
    </>
  );
}
