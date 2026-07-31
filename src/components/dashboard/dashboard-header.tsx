import type { Athlete } from "@/lib/types";

import { athleteSubtitle } from "./athlete-meta";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  eventsThisWeek?: number;
};

export function DashboardHeader({ selectedAthlete, eventsThisWeek = 0 }: DashboardHeaderProps) {
  return (
    <header>
      <p className="text-sm text-zinc-400">Today</p>
      {selectedAthlete ? (
        <>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
            {selectedAthlete.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {athleteSubtitle(selectedAthlete, eventsThisWeek)}
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Get started</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Add your first athlete through onboarding to unlock the dashboard.
          </p>
        </>
      )}
    </header>
  );
}
