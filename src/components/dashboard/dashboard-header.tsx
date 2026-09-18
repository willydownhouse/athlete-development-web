import Link from "next/link";
import type { ReactNode } from "react";

import type { Athlete } from "@/lib/types";

import { ageGroupFromDateOfBirth } from "./athlete-meta";
import { HISTORY_NAV_LABEL } from "./dashboard-nav";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  eventsMeta?: ReactNode;
  calendarHref?: string;
  statsHref?: string;
  historyHref?: string;
};

export function DashboardHeader({
  selectedAthlete,
  eventsMeta,
  calendarHref,
  statsHref,
  historyHref,
}: DashboardHeaderProps) {
  const ageGroup = selectedAthlete ? ageGroupFromDateOfBirth(selectedAthlete.dateOfBirth) : null;
  const showMetaRow = ageGroup || eventsMeta || calendarHref || statsHref || historyHref;

  return (
    <header>
      <p className="text-sm text-zinc-400">Today</p>
      {selectedAthlete ? (
        <>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
            {selectedAthlete.name}
          </h1>
          {showMetaRow ? (
            <div className="mt-1 flex items-center justify-between gap-3 text-sm text-zinc-400">
              <div className="min-w-0 truncate">
                {ageGroup ? (
                  <>
                    {ageGroup}
                    {eventsMeta ? " · " : null}
                  </>
                ) : null}
                {eventsMeta}
              </div>
              {calendarHref || statsHref || historyHref ? (
                <nav className="hidden shrink-0 items-center gap-3 lg:flex">
                  {statsHref ? (
                    <Link
                      href={statsHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      Stats
                    </Link>
                  ) : null}
                  {calendarHref ? (
                    <Link
                      href={calendarHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      Calendar
                    </Link>
                  ) : null}
                  {historyHref ? (
                    <Link
                      href={historyHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      {HISTORY_NAV_LABEL}
                    </Link>
                  ) : null}
                </nav>
              ) : null}
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
