import Link from "next/link";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { Athlete } from "@/lib/types";

import { ageGroupFromDateOfBirth } from "./athlete-meta";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  photo?: ReactNode;
  eventsMeta?: ReactNode;
  calendarHref?: string;
  statsHref?: string;
  historyHref?: string;
  profileHref?: string;
};

export async function DashboardHeader({
  selectedAthlete,
  photo,
  eventsMeta,
  calendarHref,
  statsHref,
  historyHref,
  profileHref,
}: DashboardHeaderProps) {
  const messages = getMessages(await getRequestLocale());
  const ageGroup = selectedAthlete ? ageGroupFromDateOfBirth(selectedAthlete.dateOfBirth) : null;
  const showMetaRow =
    ageGroup || eventsMeta || calendarHref || statsHref || historyHref || profileHref;

  return (
    <header>
      <p className="text-sm text-zinc-400">{messages.dashboard.todayEyebrow}</p>
      {selectedAthlete ? (
        <>
          <div className="mt-1 flex items-center gap-3">
            {photo}
            <h1 className="min-w-0 truncate text-3xl font-semibold tracking-tight text-white">
              {selectedAthlete.name}
            </h1>
          </div>
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
              {calendarHref || statsHref || historyHref || profileHref ? (
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
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="font-medium text-zinc-300 transition hover:text-white"
                    >
                      {messages.nav.profile}
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
