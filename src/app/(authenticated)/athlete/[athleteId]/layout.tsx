import { redirect } from "next/navigation";

import { loadAccessibleAthlete } from "@/lib/accessible-athlete";

type AthleteLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteLayout({ children, params }: AthleteLayoutProps) {
  const { athleteId } = await params;
  const athlete = await loadAccessibleAthlete(athleteId);

  if (!athlete) {
    redirect("/dashboard");
  }

  return children;
}
