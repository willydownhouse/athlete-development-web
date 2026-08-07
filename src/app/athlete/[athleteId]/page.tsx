import { redirect } from "next/navigation";

import { dashboardHref } from "@/components/dashboard/dashboard-nav";

type AthletePageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthletePage({ params }: AthletePageProps) {
  const { athleteId } = await params;
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    redirect("/dashboard");
  }

  redirect(dashboardHref(normalizedAthleteId));
}
