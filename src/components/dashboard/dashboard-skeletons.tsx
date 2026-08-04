import type { Athlete } from "@/lib/types";

import { Skeleton } from "@/components/ui/skeleton";

const CARD_CLASS = "rounded-[1.35rem] bg-[#171b22] px-4 py-4";

export function DashboardHeaderSkeleton({ selectedAthlete }: { selectedAthlete: Athlete }) {
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

export function TodaysEventsSkeleton() {
  return <TodaysEventsCardSkeleton />;
}

export function HockeyStatsSkeleton() {
  return (
    <section className={CARD_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-7 w-56 max-w-full rounded-lg" />
      </div>
      <HockeyStatsGridSkeleton />
    </section>
  );
}

export function HockeyStatsGridSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Skeleton className="h-[5.75rem] rounded-xl" />
      <Skeleton className="h-[5.75rem] rounded-xl" />
      <Skeleton className="h-[5.75rem] rounded-xl" />
      <Skeleton className="h-[5.75rem] rounded-xl" />
    </div>
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
