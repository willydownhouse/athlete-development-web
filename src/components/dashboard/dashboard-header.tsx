import type { ReactNode } from "react";

import type { Athlete } from "@/lib/types";

import { ageGroupFromDateOfBirth } from "./athlete-meta";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  eventsMeta?: ReactNode;
};

export function DashboardHeader({ selectedAthlete, eventsMeta }: DashboardHeaderProps) {
  const ageGroup = selectedAthlete ? ageGroupFromDateOfBirth(selectedAthlete.dateOfBirth) : null;

  return (
    <header>
      <p className="text-sm text-zinc-400">Today</p>
      {selectedAthlete ? (
        <>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
            {selectedAthlete.name}
          </h1>
          {ageGroup || eventsMeta ? (
            <div className="mt-1 text-sm text-zinc-400">
              {ageGroup ? (
                <>
                  {ageGroup}
                  {eventsMeta ? " · " : null}
                </>
              ) : null}
              {eventsMeta}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Get started</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Add your first athlete to unlock the dashboard.
          </p>
        </>
      )}
    </header>
  );
}
