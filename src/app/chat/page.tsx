import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { ChatSection } from "@/components/chat/chat-section";
import { ChatSectionSkeleton } from "@/components/chat/chat-section-skeleton";
import { VisibleViewportFrame } from "@/components/visible-viewport-frame";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

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

  const [athletes, isAdmin] = await Promise.all([loadShellAthletes(token), getIsAdminUser()]);

  return (
    <AppShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={null}
    >
      <VisibleViewportFrame className="relative mx-auto flex h-[calc(100svh-3.75rem)] w-full max-w-md flex-col overflow-hidden px-4 pt-4 sm:px-6 lg:h-svh lg:max-w-3xl lg:px-10">
        <Suspense fallback={<ChatSectionSkeleton />}>
          <ChatSection exampleAthleteName={athletes[0]?.name ?? ""} canSend={athletes.length > 0} />
        </Suspense>
      </VisibleViewportFrame>
    </AppShell>
  );
}
