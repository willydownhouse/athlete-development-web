import Link from "next/link";
import type { ReactNode } from "react";

import { ACCESS_NAV_LABEL, HISTORY_NAV_LABEL } from "@/components/dashboard/dashboard-nav";

const linkClassName =
  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-zinc-300 transition hover:text-white";

type DashboardBottomNavProps = {
  statsHref?: string;
  calendarHref: string;
  historyHref: string;
  accessHref?: string;
};

export function DashboardBottomNav({
  statsHref,
  calendarHref,
  historyHref,
  accessHref,
}: DashboardBottomNavProps) {
  return (
    <nav
      aria-label="Athlete pages"
      className="fixed inset-x-0 bottom-0 z-30 bg-[#0b0d10]/95 backdrop-blur lg:hidden"
    >
      <div className="flex px-4 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-10">
        {statsHref ? <NavLink href={statsHref} icon={<StatsIcon />} label="Stats" /> : null}
        <NavLink href={calendarHref} icon={<CalendarIcon />} label="Calendar" />
        <NavLink href={historyHref} icon={<HistoryIcon />} label={HISTORY_NAV_LABEL} />
        {accessHref ? (
          <NavLink href={accessHref} icon={<AccessIcon />} label={ACCESS_NAV_LABEL} />
        ) : null}
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className={linkClassName}>
      {icon}
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </Link>
  );
}

function StatsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 19.5v-6.75M12 19.5V4.5M19.5 19.5v-4.5"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v2m8-2v2M4.5 9.5h15M6 5.5h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l2.5 1.5M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 5.5v4h4"
      />
    </svg>
  );
}

function AccessIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3.5 19.5v-1.25A3.25 3.25 0 0 1 6.75 15h5.5A3.25 3.25 0 0 1 15.5 18.25V19.5M16.75 8.1a2.75 2.75 0 1 1 0 5.15M20.5 19.5v-1.1a2.9 2.9 0 0 0-2.15-2.8"
      />
    </svg>
  );
}
