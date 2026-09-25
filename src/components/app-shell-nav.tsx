"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AthleteAvatarImage } from "@/components/dashboard/athlete-avatar-image";
import { athleteInitials } from "@/components/dashboard/athlete-meta";
import { navLinkClass } from "@/components/app-shell-nav-styles";
import {
  activeAthleteIdFromPath,
  CHAT_HREF,
  dashboardHref,
  defaultDashboardHref,
  isAthleteDashboardPath,
  isChatPath,
  isInvitesPath,
  isOnboardingPath,
  isUsagePath,
  INVITES_HREF,
  pendingInvitesNavLabel,
  USAGE_HREF,
} from "@/components/dashboard/dashboard-nav";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import { roundedTileClassName } from "@/lib/rounded-tile";
import type { Athlete } from "@/lib/types";

type AppShellNavProps = {
  isAdmin?: boolean;
  athletes?: Athlete[];
  selectedAthlete?: Athlete | null;
  athleteAvatarUrls?: Record<string, string>;
  pendingInviteCount?: number;
  onNavigate?: () => void;
};

function AthleteNavList({
  athletes,
  athleteAvatarUrls,
  onNavigate,
}: {
  athletes: Athlete[];
  athleteAvatarUrls: Record<string, string>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeAthleteId = activeAthleteIdFromPath(pathname);

  return athletes.map((athlete) => (
    <AthleteNavLink
      key={athlete.id}
      athlete={athlete}
      avatarUrl={athleteAvatarUrls[athlete.id] ?? null}
      onNavigate={onNavigate}
      active={activeAthleteId === athlete.id}
    />
  ));
}

function AthleteNavLink({
  athlete,
  avatarUrl,
  onNavigate,
  active,
}: {
  athlete: Athlete;
  avatarUrl: string | null;
  onNavigate?: () => void;
  active: boolean;
}) {
  const initials = athleteInitials(athlete.name);

  return (
    <Link
      href={dashboardHref(athlete.id)}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5 ${
        active ? "bg-white/5 text-white" : "text-zinc-300 hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-[#2a2f38] text-xs font-semibold ${roundedTileClassName}`}
      >
        {avatarUrl ? <AthleteAvatarImage src={avatarUrl} alt="" initials={initials} /> : initials}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{athlete.name}</span>
    </Link>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
  badgeCount = 0,
  ariaLabel,
  onNavigate,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  badgeCount?: number;
  ariaLabel?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link href={href} onClick={onNavigate} className={navLinkClass(active)} aria-label={ariaLabel}>
      {icon}
      <span className="min-w-0 truncate">{children}</span>
      {badgeCount > 0 ? (
        <span
          className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#b7d7ec] px-1.5 text-[11px] font-semibold text-[#1a2430]"
          aria-hidden="true"
        >
          {badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      {children}
    </svg>
  );
}

function TodayIcon() {
  return (
    <NavIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 10.5 12 4l8.5 6.5M6 10v8.5a1 1 0 0 0 1 1h3.5V15a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 14.5 15v4.5H18a1 1 0 0 0 1-1V10"
      />
    </NavIcon>
  );
}

function ChatIcon() {
  return (
    <NavIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 18.5 4 20.5V7.5A2 2 0 0 1 6 5.5h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8.5z"
      />
      <path strokeLinecap="round" d="M8.5 10.5h7M8.5 13.5h4.5" />
    </NavIcon>
  );
}

function InvitesIcon() {
  return (
    <NavIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 8 12 13.25 19.5 8M5.5 6.5h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
      />
    </NavIcon>
  );
}

function UsageIcon() {
  return (
    <NavIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 19.5v-6.75M12 19.5V4.5M19.5 19.5v-4.5"
      />
    </NavIcon>
  );
}

function AddAthleteIcon() {
  return (
    <NavIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.5 19.5v-1.25A3.25 3.25 0 0 0 12.25 15h-5.5A3.25 3.25 0 0 0 3.5 18.25v1.25M9.5 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 8.5v5M14.5 11H19.5"
      />
    </NavIcon>
  );
}

function AdminIcon() {
  return (
    <NavIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 19.5 7v4.5c0 4.5-3.1 7.8-7.5 9-4.4-1.2-7.5-4.5-7.5-9V7L12 3.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.2 11.2 14l3.3-3.5" />
    </NavIcon>
  );
}

export function AppShellNav({
  isAdmin = false,
  athletes = [],
  selectedAthlete = null,
  athleteAvatarUrls = {},
  pendingInviteCount = 0,
  onNavigate,
}: AppShellNavProps) {
  const pathname = usePathname();
  const locale = useAppLocale();
  const messages = getMessages(locale);
  const dashboardLink =
    selectedAthlete !== null ? dashboardHref(selectedAthlete.id) : defaultDashboardHref(athletes);

  return (
    <nav className="space-y-1">
      <div>
        <NavLink
          href={dashboardLink}
          active={isAthleteDashboardPath(pathname)}
          icon={<TodayIcon />}
          onNavigate={onNavigate}
        >
          {messages.nav.today}
        </NavLink>

        {athletes.length > 0 ? (
          <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
            <AthleteNavList
              athletes={athletes}
              athleteAvatarUrls={athleteAvatarUrls}
              onNavigate={onNavigate}
            />
          </div>
        ) : null}
      </div>

      <NavLink
        href={CHAT_HREF}
        active={isChatPath(pathname)}
        icon={<ChatIcon />}
        onNavigate={onNavigate}
      >
        {messages.nav.chat}
      </NavLink>

      <NavLink
        href={INVITES_HREF}
        active={isInvitesPath(pathname)}
        icon={<InvitesIcon />}
        badgeCount={pendingInviteCount}
        ariaLabel={
          pendingInviteCount > 0 ? pendingInvitesNavLabel(pendingInviteCount, locale) : undefined
        }
        onNavigate={onNavigate}
      >
        {messages.nav.invites}
      </NavLink>

      <NavLink
        href={USAGE_HREF}
        active={isUsagePath(pathname)}
        icon={<UsageIcon />}
        onNavigate={onNavigate}
      >
        {messages.nav.usage}
      </NavLink>

      <NavLink
        href="/onboarding"
        active={isOnboardingPath(pathname)}
        icon={<AddAthleteIcon />}
        onNavigate={onNavigate}
      >
        {messages.nav.addAthlete}
      </NavLink>

      {isAdmin ? (
        <NavLink href="/admin" active={pathname.startsWith("/admin")} icon={<AdminIcon />}>
          {messages.common.admin}
        </NavLink>
      ) : null}
    </nav>
  );
}
