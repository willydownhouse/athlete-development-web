import { ChatView } from "@/components/chat/chat-view";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { createChatThread, fetchLatestChatMessages } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { ChatMessage } from "@/lib/types";

type ChatSectionProps = {
  exampleAthleteName: string;
  canSend: boolean;
};

export async function ChatSection({ exampleAthleteName, canSend }: ChatSectionProps) {
  const [token, timeZone, actions] = await Promise.all([
    getAuthBearerToken(),
    getRequestTimeZone(),
    getActionMessages(),
  ]);
  const nowIso = new Date().toISOString();

  if (!token) {
    return (
      <ChatView
        threadId={null}
        messages={[]}
        hasMore={false}
        timeZone={timeZone}
        nowIso={nowIso}
        exampleAthleteName={exampleAthleteName}
        canSend={canSend}
        loadError={actions.signInAgain}
      />
    );
  }

  let threadId: string | null = null;
  let messages: ChatMessage[] = [];
  let hasMore = false;
  let loadError: string | null = null;

  try {
    const thread = await createChatThread(token);
    threadId = thread.id;
  } catch (error) {
    loadError = passthroughOrGeneric(error, actions.loadChat);
  }

  if (threadId) {
    try {
      const latest = await fetchLatestChatMessages(token, threadId);
      messages = latest.items;
      hasMore = latest.pagination.hasMore;
    } catch (error) {
      loadError = passthroughOrGeneric(error, actions.loadMessages);
    }
  }

  return (
    <ChatView
      threadId={threadId}
      messages={messages}
      hasMore={hasMore}
      timeZone={timeZone}
      nowIso={nowIso}
      exampleAthleteName={exampleAthleteName}
      canSend={canSend}
      loadError={loadError}
    />
  );
}
