import {
  eventsAggregateHeading,
  formatEventsAggregateCoverage,
  formatEventsAggregateTotal,
  type EventsAggregateSubject,
} from "@/lib/events-aggregate-format";
import type { EventAggregate, EventItemAggregate } from "@/lib/types";

type EventsAggregateContentProps = {
  result: EventAggregate | EventItemAggregate;
  subject?: EventsAggregateSubject;
  descendantNoun?: string;
};

function isEventItemAggregate(
  result: EventAggregate | EventItemAggregate,
): result is EventItemAggregate {
  return "matchingItemCount" in result;
}

export function EventsAggregateContent({
  result,
  subject,
  descendantNoun,
}: EventsAggregateContentProps) {
  const resolvedSubject = subject ?? (isEventItemAggregate(result) ? "item" : "event");

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <h2 className="text-base font-semibold text-white">
        {eventsAggregateHeading(result.aggregation, resolvedSubject)}
      </h2>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {formatEventsAggregateTotal(result)}
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        {formatEventsAggregateCoverage(result, resolvedSubject, descendantNoun)}
      </p>
    </section>
  );
}
