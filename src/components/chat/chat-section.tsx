import { ChatView } from "@/components/chat/chat-view";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { createChatThread, fetchLatestChatMessages, fetchOnboardingChatMessages } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { ONBOARDING_ATHLETE_QUERY_PARAM, onboardingChatQuery } from "@/lib/onboarding-chat";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { ChatMessage } from "@/lib/types";

type ChatSectionProps = {
  searchParams: Promise<Partial<Record<typeof ONBOARDING_ATHLETE_QUERY_PARAM, string | string[]>>>;
};

export async function ChatSection({ searchParams }: ChatSectionProps) {
  const query = onboardingChatQuery((await searchParams)[ONBOARDING_ATHLETE_QUERY_PARAM]);
  const [token, timeZone, actions] = await Promise.all([
    getAuthBearerToken(),
    getRequestTimeZone(),
    getActionMessages(),
  ]);
  const nowIso = new Date().toISOString();

  const onboardingAthleteId = query.kind === "interview" ? query.athleteId : null;
  const transcriptKey = query.kind === "interview" ? query.athleteId : query.kind;

  if (!token) {
    return (
      <ChatView
        key={transcriptKey}
        threadId={null}
        messages={[]}
        hasMore={false}
        timeZone={timeZone}
        nowIso={nowIso}
        onboardingAthleteId={onboardingAthleteId}
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

  if (threadId && query.kind === "invalid") {
    loadError = actions.loadMessages;
  } else if (threadId && query.kind === "interview") {
    try {
      const latest = await fetchOnboardingChatMessages(token, threadId, query.athleteId);
      messages = latest.items;
      hasMore = latest.pagination.hasMore;
    } catch (error) {
      loadError = passthroughOrGeneric(error, actions.loadMessages);
    }
  } else if (threadId) {
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
      key={transcriptKey}
      threadId={threadId}
      messages={messages}
      hasMore={hasMore}
      timeZone={timeZone}
      nowIso={nowIso}
      onboardingAthleteId={onboardingAthleteId}
      loadError={loadError}
    />
  );
}
