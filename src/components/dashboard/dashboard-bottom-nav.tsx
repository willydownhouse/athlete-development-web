import Link from "next/link";

import { HISTORY_NAV_LABEL } from "@/components/dashboard/dashboard-nav";

const linkClassName =
  "flex flex-1 items-center justify-center py-2.5 text-sm font-medium text-zinc-300 transition hover:text-white";

type DashboardBottomNavProps = {
  statsHref?: string;
  calendarHref: string;
  historyHref: string;
};

export function DashboardBottomNav({
  statsHref,
  calendarHref,
  historyHref,
}: DashboardBottomNavProps) {
  return (
    <nav
      aria-label="Athlete pages"
      className="fixed inset-x-0 bottom-0 z-30 bg-[#0b0d10]/95 backdrop-blur lg:hidden"
    >
      <div className="flex px-4 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-10">
        {statsHref ? (
          <Link href={statsHref} className={linkClassName}>
            Stats
          </Link>
        ) : null}
        <Link href={calendarHref} className={linkClassName}>
          Calendar
        </Link>
        <Link href={historyHref} className={linkClassName}>
          {HISTORY_NAV_LABEL}
        </Link>
      </div>
    </nav>
  );
}
