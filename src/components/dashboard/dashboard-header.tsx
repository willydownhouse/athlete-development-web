import type { Athlete } from "@/lib/types";

import { athleteSubtitle } from "./athlete-meta";
import { MOCK_EVENTS_THIS_WEEK } from "./mock-data";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
};

export function DashboardHeader({ selectedAthlete }: DashboardHeaderProps) {
  return (
    <header>
      <p className="text-sm text-zinc-400">Today</p>
      {selectedAthlete ? (
        <>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
            {selectedAthlete.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {athleteSubtitle(selectedAthlete, MOCK_EVENTS_THIS_WEEK)}
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">No athletes yet</h1>
          <p className="mt-1 text-sm text-zinc-400">Athletes you add will show up here.</p>
        </>
      )}
    </header>
  );
}
