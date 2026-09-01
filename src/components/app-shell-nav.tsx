"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { athleteInitials } from "@/components/dashboard/athlete-meta";
import { navLinkClass } from "@/components/app-shell-nav-styles";
import {
  activeAthleteIdFromPath,
  CHAT_HREF,
  CHAT_NAV_LABEL,
  dashboardHref,
  defaultDashboardHref,
  isAthleteDashboardPath,
  isChatPath,
  TODAY_NAV_LABEL,
} from "@/components/dashboard/dashboard-nav";
import type { Athlete } from "@/lib/types";

type AppShellNavProps = {
  isAdmin?: boolean;
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

export function AppShellNav({
  isAdmin = false,
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
          {TODAY_NAV_LABEL}
        </Link>

        {athletes.length > 1 ? (
          <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
            <AthleteNavList athletes={athletes} onNavigate={onNavigate} />
          </div>
        ) : null}
      </div>

      <Link href={CHAT_HREF} onClick={onNavigate} className={navLinkClass(isChatPath(pathname))}>
        {CHAT_NAV_LABEL}
      </Link>

      <Link
        href="/onboarding"
        onClick={onNavigate}
        className={navLinkClass(pathname.startsWith("/onboarding"))}
      >
        Add athlete
      </Link>

      {isAdmin ? (
        <Link href="/admin" className={navLinkClass(pathname.startsWith("/admin"))}>
          Admin
        </Link>
      ) : null}
    </nav>
  );
}
