import { EventsAggregateContent } from "@/components/dashboard/events-aggregate-content";
import { EventsListContent } from "@/components/dashboard/events-list-content";
import { eventsAggregateHeading } from "@/lib/events-aggregate-format";
import {
  fetchAthleteEventItemsAggregate,
  fetchAthleteEventsAggregate,
  fetchAthleteEventsList,
} from "@/lib/events-list-data";
import { itemMeasureChildNoun } from "@/lib/events-list-metrics";
import {
  isEventsListAggregateShow,
  isEventsListExerciseMeasure,
  isEventsListItemMeasure,
  isEventsListItemShow,
  isEventsListMetricShow,
  type EventsListSearchParams,
} from "@/lib/events-list-params";
import type { EventItemType, EventItemTypeChildType } from "@/lib/types";

type EventsListSectionProps = {
  athleteId: string;
  timeZone: string;
  params: EventsListSearchParams;
  itemTypes: EventItemType[];
  itemTypeChildTypes: EventItemTypeChildType[];
};

function resultError(message: string) {
  return <p className="rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">{message}</p>;
}

export async function EventsListSection({
  athleteId,
  timeZone,
  params,
  itemTypes,
  itemTypeChildTypes,
}: EventsListSectionProps) {
  if (isEventsListExerciseMeasure(params.measure) && !params.label) {
    return (
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
        <h2 className="text-base font-semibold text-white">
          {eventsAggregateHeading(
            isEventsListItemShow(params.show) ? params.show : "count",
            "exercise",
          )}
        </h2>
        <p className="mt-4 text-sm text-zinc-500">Enter an exercise name.</p>
      </section>
    );
  }

  if (isEventsListItemMeasure(params.measure)) {
    if (isEventsListMetricShow(params.show) && !params.metricDefinitionId) {
      return (
        <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
          <h2 className="text-base font-semibold text-white">
            {params.show === "metricAverage" ? "Metric average" : "Metric total"}
          </h2>
          <p className="mt-4 text-sm text-zinc-500">Select a metric.</p>
        </section>
      );
    }
    const result = await fetchAthleteEventItemsAggregate(athleteId, params, itemTypes);

    if (result.error) {
      return resultError(result.error);
    }

    if (!result.data) {
      return resultError("Unable to load total");
    }

    return (
      <EventsAggregateContent
        result={result.data}
        subject={isEventsListExerciseMeasure(params.measure) ? "exercise" : "item"}
        descendantNoun={
          isEventsListMetricShow(params.show)
            ? itemMeasureChildNoun(params.measure, itemTypes, itemTypeChildTypes)
            : undefined
        }
      />
    );
  }

  if (isEventsListMetricShow(params.show) && !params.metricDefinitionId) {
    return (
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
        <h2 className="text-base font-semibold text-white">
          {params.show === "metricAverage" ? "Metric average" : "Metric total"}
        </h2>
        <p className="mt-4 text-sm text-zinc-500">Select a metric.</p>
      </section>
    );
  }

  if (isEventsListAggregateShow(params.show)) {
    const result = await fetchAthleteEventsAggregate(athleteId, params);

    if (result.error) {
      return resultError(result.error);
    }

    if (!result.data) {
      return resultError("Unable to load total");
    }

    return <EventsAggregateContent result={result.data} />;
  }

  const result = await fetchAthleteEventsList(athleteId, params);

  if (result.error) {
    return resultError(result.error);
  }

  if (!result.data) {
    return resultError("Unable to load events");
  }

  return (
    <EventsListContent
      athleteId={athleteId}
      params={params}
      events={result.data.items}
      timeZone={timeZone}
      total={result.data.pagination.total}
    />
  );
}
