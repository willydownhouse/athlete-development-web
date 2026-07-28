import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { fetchAthletes, fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

type DashboardPageProps = {
  searchParams: Promise<{ athleteId?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await searchParams;
  const token = await getAuthBearerToken();

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

  const selectedAthlete =
    athletes.find((athlete) => athlete.id === athleteId) ?? athletes[0] ?? null;

  return (
    <DashboardView
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      loadError={loadError}
    />
  );
}
