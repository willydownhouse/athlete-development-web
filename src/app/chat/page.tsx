import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatView } from "@/components/chat/chat-view";
import { chatHref } from "@/components/chat/chat-nav";
import { fetchAthletes, fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellOnboardingSessions } from "@/lib/shell-data";

type ChatPageProps = {
  searchParams: Promise<{ athleteId?: string }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await searchParams;
  const token = await getAuthBearerToken();
  const onboardingSessions = await loadShellOnboardingSessions(token);

  let athletes = [] as Awaited<ReturnType<typeof fetchAthletes>>;
  let isAdmin = false;
  let loadError: string | null = null;

  if (token) {
    const [athletesResult, appUserResult] = await Promise.allSettled([
      fetchAthletes(token),
      fetchCurrentAppUser(token),
    ]);

    if (athletesResult.status === "fulfilled") {
      athletes = athletesResult.value;
    } else {
      loadError =
        athletesResult.reason instanceof Error
          ? athletesResult.reason.message
          : "Unable to load athletes";
    }

    if (appUserResult.status === "fulfilled") {
      isAdmin = appUserResult.value.role === "admin";
    }
  } else {
    loadError = "Missing Auth.js session token";
  }

  if (athletes.length > 0) {
    const normalizedAthleteId = athleteId?.trim() ?? "";
    const selectedFromUrl = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

    if (!normalizedAthleteId || !selectedFromUrl) {
      const firstAthlete = athletes[0];
      if (firstAthlete) {
        redirect(chatHref(firstAthlete.id));
      }
    }
  }

  const selectedAthlete =
    athleteId && athletes.length > 0
      ? (athletes.find((athlete) => athlete.id === athleteId) ?? null)
      : null;

  return (
    <ChatView
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      loadError={loadError}
      onboardingSessions={onboardingSessions}
    />
  );
}
