"use client";

import { ChatMessageListSkeleton } from "@/components/chat/chat-message-list";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";

export function ChatSectionSkeleton() {
  const showSkeleton = useDelayedLoading(true);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-hidden">
          {showSkeleton ? <ChatMessageListSkeleton /> : null}
        </div>
      </div>
      <div className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="h-14 rounded-2xl bg-[#1c222c]" />
      </div>
    </div>
  );
}
