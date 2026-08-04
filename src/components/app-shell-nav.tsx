"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { athleteInitials } from "@/components/dashboard/athlete-meta";
import { navLinkClass } from "@/components/app-shell-nav-styles";
import {
  activeAthleteIdFromPath,
  dashboardHref,
  defaultDashboardHref,
  isAthleteDashboardPath,
} from "@/components/dashboard/dashboard-nav";
import {
  activeOnboardingSessionId,
  onboardingSessionAvatarClass,
  onboardingSessionHref,
  onboardingSessionStatusLabel,
} from "@/components/onboarding/onboarding-session-nav";
import type { Athlete, OnboardingSessionSummary } from "@/lib/types";

type AppShellNavProps = {
  adminNavLink?: ReactNode;
  onboardingSessions: OnboardingSessionSummary[];
  athletes?: Athlete[];
  selectedAthlete?: Athlete | null;
  dashboardAthleteId?: string | null;
  onNavigate?: () => void;
};

function AthleteNavList({
  athletes,
  onNavigate,
}: {
  athletes: Athlete[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeAthleteId = activeAthleteIdFromPath(pathname);

  return athletes.map((athlete) => (
    <AthleteNavLink
      key={athlete.id}
      athlete={athlete}
      onNavigate={onNavigate}
      active={activeAthleteId === athlete.id}
    />
  ));
}

function AthleteNavLink({
  athlete,
  onNavigate,
  active,
}: {
  athlete: Athlete;
  onNavigate?: () => void;
  active: boolean;
}) {
  return (
    <Link
      href={dashboardHref(athlete.id)}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5 ${
        active ? "bg-white/5 text-white" : "text-zinc-300 hover:text-white"
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2f38] text-xs font-semibold">
        {athleteInitials(athlete.name)}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{athlete.name}</span>
    </Link>
  );
}

function OnboardingSessionNavList({
  sessions,
  onNavigate,
}: {
  sessions: OnboardingSessionSummary[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeSessionId = activeOnboardingSessionId(pathname);

  return sessions.map((session) => (
    <OnboardingSessionNavLink
      key={session.id}
      session={session}
      onNavigate={onNavigate}
      active={activeSessionId === session.id}
    />
  ));
}

function OnboardingSessionNavLink({
  session,
  onNavigate,
  active,
}: {
  session: OnboardingSessionSummary;
  onNavigate?: () => void;
  active: boolean;
}) {
  return (
    <Link
      href={onboardingSessionHref(session)}
      onClick={onNavigate}
      title={onboardingSessionStatusLabel(session.status)}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5 ${
        active ? "bg-white/5 text-white" : "text-zinc-300 hover:text-white"
      }`}
    >
      <span
        className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2f38] text-xs font-semibold ${onboardingSessionAvatarClass(session.status)}`}
      >
        {athleteInitials(session.athlete.name)}
        <SessionStatusIcon status={session.status} />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{session.athlete.name}</span>
    </Link>
  );
}

function SessionStatusIcon({ status }: { status: OnboardingSessionSummary["status"] }) {
  if (status === "completed") {
    return (
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[#0b0d10]">
        <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5" fill="none">
          <path
            d="M2.5 6l2.5 2.5 4.5-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#12161d] bg-[#9ec9e8]" />
    );
  }

  return (
    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#12161d] bg-zinc-500" />
  );
}

export function AppShellNav({
  adminNavLink,
  onboardingSessions,
  athletes = [],
  selectedAthlete = null,
  dashboardAthleteId = null,
  onNavigate,
}: AppShellNavProps) {
  const pathname = usePathname();
  const dashboardLink = dashboardAthleteId
    ? dashboardHref(dashboardAthleteId)
    : selectedAthlete !== null
      ? dashboardHref(selectedAthlete.id)
      : defaultDashboardHref(athletes);

  return (
    <nav className="space-y-1">
      <div>
        <Link
          href={dashboardLink}
          onClick={onNavigate}
          className={navLinkClass(isAthleteDashboardPath(pathname))}
        >
          Dashboard
        </Link>

        {athletes.length > 1 ? (
          <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
            <AthleteNavList athletes={athletes} onNavigate={onNavigate} />
          </div>
        ) : null}
      </div>

      <div>
        <Link
          href="/onboarding"
          onClick={onNavigate}
          className={navLinkClass(pathname.startsWith("/onboarding"))}
        >
          Onboarding
        </Link>

        {onboardingSessions.length > 0 ? (
          <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
            <Suspense
              fallback={onboardingSessions.map((session) => (
                <OnboardingSessionNavLink
                  key={session.id}
                  session={session}
                  onNavigate={onNavigate}
                  active={false}
                />
              ))}
            >
              <OnboardingSessionNavList sessions={onboardingSessions} onNavigate={onNavigate} />
            </Suspense>
          </div>
        ) : null}
      </div>

      {adminNavLink}
    </nav>
  );
}
