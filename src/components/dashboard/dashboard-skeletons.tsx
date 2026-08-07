import type { Athlete } from "@/lib/types";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";

import { Skeleton } from "@/components/ui/skeleton";

import { HockeyStatsSection } from "./hockey-stats-section";

const CARD_CLASS = "rounded-[1.35rem] bg-[#171b22] px-4 py-4";

function DashboardHeaderSkeleton({ selectedAthlete }: { selectedAthlete: Athlete }) {
  return (
    <header>
      <p className="text-sm text-zinc-400">Today</p>
      <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
        {selectedAthlete.name}
      </h1>
      <Skeleton className="mt-2 h-4 w-52 max-w-full" />
    </header>
  );
}

function EventListRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-1 py-1.5">
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2.5 pt-1">
        <Skeleton className="h-4 w-[68%]" />
        <Skeleton className="h-3.5 w-[44%]" />
      </div>
    </div>
  );
}

function TodaysEventsCardSkeleton() {
  return (
    <section className={CARD_CLASS}>
      <Skeleton className="h-5 w-32" />
      <div className="mt-4 space-y-3">
        <EventListRowSkeleton />
        <EventListRowSkeleton />
        <EventListRowSkeleton />
      </div>
    </section>
  );
}

function TodaysEventsSkeleton() {
  return <TodaysEventsCardSkeleton />;
}

function QuickLogSkeleton() {
  return (
    <section className={CARD_CLASS}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Quick log</h2>
        <div className="flex flex-wrap justify-end gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>
    </section>
  );
}

function CalendarSectionSkeleton() {
  return (
    <section className={CARD_CLASS}>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="mt-4 h-52 w-full rounded-xl" />
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-14 rounded-lg" />
        </div>
        <CalendarDayEventsSkeleton />
      </div>
    </section>
  );
}

export function DashboardEventsSkeleton({ selectedAthlete }: { selectedAthlete: Athlete }) {
  return (
    <>
      <DashboardHeaderSkeleton selectedAthlete={selectedAthlete} />
      <div className="mt-6 flex flex-col gap-3.5">
        <TodaysEventsSkeleton />
        <QuickLogSkeleton />
        <CalendarSectionSkeleton />
      </div>
    </>
  );
}

function HockeyStatsTileSkeleton({ withSubtitle = false }: { withSubtitle?: boolean }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-3">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="mt-1 h-4 w-24" />
      {withSubtitle ? <Skeleton className="mt-0.5 h-3.5 w-20" /> : null}
    </div>
  );
}

export function HockeyStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <HockeyStatsTileSkeleton />
      <HockeyStatsTileSkeleton withSubtitle />
      <HockeyStatsTileSkeleton withSubtitle />
      <HockeyStatsTileSkeleton />
    </div>
  );
}

export function HockeyStatsSkeleton({
  sportName,
  period,
}: {
  sportName: string;
  period: HockeyStatsPeriod;
}) {
  return (
    <HockeyStatsSection sportName={sportName} period={period}>
      <HockeyStatsGridSkeleton />
    </HockeyStatsSection>
  );
}

export function CalendarDayEventsSkeleton() {
  return (
    <div className="mt-4 space-y-3">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <article className="rounded-2xl border border-white/5 bg-[#12161d] p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3.5 w-[40%]" />
        </div>
        <Skeleton className="h-7 w-12 rounded-lg" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </article>
  );
}

export function EventsListSkeleton() {
  return (
    <section className={CARD_CLASS}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mt-4 space-y-3">
        <EventListRowSkeleton />
        <EventListRowSkeleton />
        <EventListRowSkeleton />
      </div>
      <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </section>
  );
}
