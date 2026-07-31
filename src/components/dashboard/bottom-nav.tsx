"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { chatHref } from "@/components/chat/chat-nav";

import { dashboardHref } from "./dashboard-nav";

type DashboardBottomNavProps = {
  selectedAthleteId?: string | null;
};

function navItemClass(active: boolean): string {
  return `rounded-full px-6 py-2.5 text-sm font-semibold transition sm:px-8 ${
    active
      ? "bg-[#b7d7ec] text-[#1a2430]"
      : "border border-white/10 bg-[#171b22] text-zinc-200 hover:bg-[#1f2530]"
  }`;
}

export function DashboardBottomNav({ selectedAthleteId }: DashboardBottomNavProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isChat = pathname.startsWith("/chat");

  const dashboardLink = selectedAthleteId ? dashboardHref(selectedAthleteId) : "/dashboard";
  const chatLink = selectedAthleteId ? chatHref(selectedAthleteId) : "/chat";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0f1217]/90 backdrop-blur-md lg:left-64"
    >
      <div className="mx-auto flex w-full max-w-md justify-center gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:gap-3">
        <Link
          href={dashboardLink}
          aria-current={isDashboard ? "page" : undefined}
          className={navItemClass(isDashboard)}
        >
          Dashboard
        </Link>
        <Link
          href={chatLink}
          aria-current={isChat ? "page" : undefined}
          className={navItemClass(isChat)}
        >
          Chat
        </Link>
      </div>
    </nav>
  );
}
