import Link from "next/link";

import { athleteEventsHref } from "@/components/dashboard/dashboard-nav";
import {
  buildEventsListQueryString,
  eventsListPageCount,
  type EventsListSearchParams,
} from "@/lib/events-list-params";

type EventsListPaginationProps = {
  athleteId: string;
  params: EventsListSearchParams;
  total: number;
};

function pageHref(athleteId: string, params: EventsListSearchParams, page: number): string {
  const query = buildEventsListQueryString({ ...params, page, offset: (page - 1) * params.limit });
  const base = athleteEventsHref(athleteId);
  return query ? `${base}?${query}` : base;
}

export function EventsListPagination({ athleteId, params, total }: EventsListPaginationProps) {
  const pageCount = eventsListPageCount(total, params.limit);

  if (total <= params.limit) {
    return null;
  }

  const previousPage = Math.max(params.page - 1, 1);
  const nextPage = Math.min(params.page + 1, pageCount);
  const canGoPrevious = params.page > 1;
  const canGoNext = params.page < pageCount;

  return (
    <nav
      aria-label="Events pagination"
      className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-zinc-400">
        Page {params.page} of {pageCount}
      </p>

      <div className="flex gap-2">
        {canGoPrevious ? (
          <Link
            href={pageHref(athleteId, params, previousPage)}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-[#252b36]"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-xl border border-white/5 bg-[#171b22] px-4 py-2 text-sm font-medium text-zinc-500">
            Previous
          </span>
        )}

        {canGoNext ? (
          <Link
            href={pageHref(athleteId, params, nextPage)}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-[#252b36]"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-xl border border-white/5 bg-[#171b22] px-4 py-2 text-sm font-medium text-zinc-500">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
