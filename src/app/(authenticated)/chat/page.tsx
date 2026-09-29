import { Suspense } from "react";

import { ChatSection } from "@/components/chat/chat-section";
import { ChatSectionSkeleton } from "@/components/chat/chat-section-skeleton";
import { VisibleViewportFrame } from "@/components/visible-viewport-frame";

export const maxDuration = 240;

export default function ChatPage() {
  return (
    <VisibleViewportFrame className="relative mx-auto flex h-[calc(100svh-3.75rem)] w-full max-w-md flex-col overflow-hidden px-4 pt-4 sm:px-6 lg:h-svh lg:max-w-3xl lg:px-10">
      <Suspense fallback={<ChatSectionSkeleton />}>
        <ChatSection />
      </Suspense>
    </VisibleViewportFrame>
  );
}
