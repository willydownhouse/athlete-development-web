import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatView } from "@/components/chat/chat-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createChatThread, fetchLatestChatMessages } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 240;

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [athletes, isAdmin, timeZone] = await Promise.all([
    loadShellAthletes(token),
    getIsAdminUser(),
    getRequestTimeZone(),
  ]);

  let threadId: string | null = null;
  let messages: ChatMessage[] = [];
  let loadError: string | null = null;

  try {
    const thread = await createChatThread(token);
    threadId = thread.id;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load chat";
  }

  if (threadId) {
    try {
      const latest = await fetchLatestChatMessages(token, threadId);
      messages = latest.items;
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Unable to load messages";
    }
  }

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={null}
    >
      <div className="relative mx-auto flex h-[calc(100dvh-3.75rem)] w-full max-w-md flex-col overflow-hidden px-4 pt-6 sm:px-6 lg:h-dvh lg:max-w-3xl lg:px-10">
        <ChatView
          threadId={threadId}
          messages={messages}
          timeZone={timeZone}
          nowIso={new Date().toISOString()}
          loadError={loadError}
        />
      </div>
    </DashboardShell>
  );
}
