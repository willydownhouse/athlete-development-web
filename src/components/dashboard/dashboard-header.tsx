import Link from "next/link";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { Athlete } from "@/lib/types";

import { ageGroupFromDateOfBirth } from "./athlete-meta";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  eventsMeta?: ReactNode;
  calendarHref?: string;
  statsHref?: string;
  historyHref?: string;
  accessHref?: string;
};

export async function DashboardHeader({
  selectedAthlete,
  eventsMeta,
  calendarHref,
  statsHref,
  historyHref,
  accessHref,
}: DashboardHeaderProps) {
  const messages = getMessages(await getRequestLocale());
  const ageGroup = selectedAthlete ? ageGroupFromDateOfBirth(selectedAthlete.dateOfBirth) : null;
  const showMetaRow =
    ageGroup || eventsMeta || calendarHref || statsHref || historyHref || accessHref;

  return (
    <header>
      <p className="text-sm text-zinc-400">{messages.dashboard.todayEyebrow}</p>
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
              {calendarHref || statsHref || historyHref || accessHref ? (
                <nav className="hidden shrink-0 items-center gap-3 lg:flex">
                  {statsHref ? (
                    <Link
                      href={statsHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      {messages.nav.stats}
                    </Link>
                  ) : null}
                  {calendarHref ? (
                    <Link
                      href={calendarHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      {messages.nav.calendar}
                    </Link>
                  ) : null}
                  {historyHref ? (
                    <Link
                      href={historyHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      {messages.nav.history}
                    </Link>
                  ) : null}
                  {accessHref ? (
                    <Link
                      href={accessHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      {messages.nav.access}
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {messages.dashboard.getStarted}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{messages.dashboard.getStartedHint}</p>
        </>
      )}
    </header>
  );
}
