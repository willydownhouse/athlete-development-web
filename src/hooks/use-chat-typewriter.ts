"use client";

import { useEffect, useState } from "react";

import {
  nextChatTypewriterCount,
  prefersReducedChatMotion,
  splitChatGraphemes,
  visibleChatTypewriterText,
} from "@/lib/chat-typewriter";

export function useIncomingAssistantTypewriter(
  isPending: boolean,
  assistantMessageId: string | null,
): string | null {
  const [tracked, setTracked] = useState({
    wasPending: isPending,
    messageId: null as string | null,
  });

  if (isPending !== tracked.wasPending) {
    const messageId = isPending ? null : assistantMessageId;
    setTracked({
      wasPending: isPending,
      messageId,
    });
    return messageId;
  }

  return tracked.messageId;
}

export function useChatTypewriter(
  text: string,
  onTick?: () => void,
): { visible: string; complete: boolean } {
  const total = splitChatGraphemes(text).length;
  const skip = prefersReducedChatMotion() || total === 0;
  const [revealedCount, setRevealedCount] = useState(() => (skip ? total : 0));

  useEffect(() => {
    if (skip) {
      return;
    }

    let current = 0;
    let frameId = 0;

    const step = () => {
      current = nextChatTypewriterCount(current, total);
      setRevealedCount(current);
      onTick?.();
      if (current < total) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [onTick, skip, text, total]);

  const visible = visibleChatTypewriterText(text, revealedCount);
  return { visible, complete: visible === text };
}
