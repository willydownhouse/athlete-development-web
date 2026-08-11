import Link from "next/link";

import type { Athlete } from "@/lib/types";

import { ageGroupFromDateOfBirth, athleteEventsThisWeekLabel } from "./athlete-meta";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  eventsThisWeek?: number;
  eventsWeekHref?: string;
};

export function DashboardHeader({
  selectedAthlete,
  eventsThisWeek = 0,
  eventsWeekHref,
}: DashboardHeaderProps) {
  const ageGroup = selectedAthlete ? ageGroupFromDateOfBirth(selectedAthlete.dateOfBirth) : null;
  const eventsLabel = athleteEventsThisWeekLabel(eventsThisWeek);
  const eventsHref = selectedAthlete ? eventsWeekHref : null;

  return (
    <header>
      <p className="text-sm text-zinc-400">Today</p>
      {selectedAthlete ? (
        <>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
            {selectedAthlete.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {ageGroup ? (
              <>
                {ageGroup}
                {" · "}
              </>
            ) : null}
            {eventsHref ? (
              <Link href={eventsHref} className="transition hover:text-zinc-200">
                {eventsLabel}
              </Link>
            ) : (
              eventsLabel
            )}
          </p>
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
