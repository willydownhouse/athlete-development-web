import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { fetchAthletes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();

  let athletes = [] as Awaited<ReturnType<typeof fetchAthletes>>;
  let loadError: string | null = null;

  if (token) {
    try {
      athletes = await fetchAthletes(token);
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Unable to load athletes";
    }
  } else {
    loadError = "Missing Auth.js session token";
  }

  const firstAthlete = athletes[0];
  if (firstAthlete) {
    redirect(dashboardHref(firstAthlete.id));
  }

  return (
    <DashboardView
      userEmail={session.user.email ?? ""}
      athletes={athletes}
      selectedAthlete={null}
      eventTypes={[]}
      loadError={loadError}
    />
  );
}
