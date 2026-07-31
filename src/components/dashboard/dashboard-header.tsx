"use client";

import { useTranslations } from "next-intl";

import type { Athlete } from "@/lib/types";

import { athleteSubtitle } from "./athlete-meta";

type DashboardHeaderProps = {
  selectedAthlete: Athlete | null;
  eventsThisWeek?: number;
};

export function DashboardHeader({ selectedAthlete, eventsThisWeek = 0 }: DashboardHeaderProps) {
  const t = useTranslations("dashboard.header");
  const tCommon = useTranslations("common");
  const tSubtitle = useTranslations("dashboard.athleteSubtitle");

  return (
    <header>
      <p className="text-sm text-zinc-400">{tCommon("today")}</p>
      {selectedAthlete ? (
        <>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
            {selectedAthlete.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {athleteSubtitle(selectedAthlete, eventsThisWeek, tSubtitle)}
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {tCommon("getStarted")}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{t("getStartedDescription")}</p>
        </>
      )}
    </header>
  );
}
