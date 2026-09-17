import { EventsAggregateContent } from "@/components/dashboard/events-aggregate-content";
import { EventsListContent } from "@/components/dashboard/events-list-content";
import {
  fetchAthleteEventItemsAggregate,
  fetchAthleteEventsAggregate,
  fetchAthleteEventsList,
} from "@/lib/events-list-data";
import {
  isEventsListAggregateShow,
  isEventsListExerciseMeasure,
  isEventsListItemMeasure,
  isEventsListMetricShow,
  type EventsListSearchParams,
} from "@/lib/events-list-params";

type EventsListSectionProps = {
  athleteId: string;
  timeZone: string;
  params: EventsListSearchParams;
};

function resultError(message: string) {
  return <p className="rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">{message}</p>;
}

export async function EventsListSection({ athleteId, timeZone, params }: EventsListSectionProps) {
  if (isEventsListExerciseMeasure(params.measure) && !params.label) {
    return (
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
        <h2 className="text-base font-semibold text-white">
          {params.show === "durationSeconds" ? "Total duration" : "Item count"}
        </h2>
        <p className="mt-4 text-sm text-zinc-500">Enter an exercise name.</p>
      </section>
    );
  }

  if (isEventsListItemMeasure(params.measure)) {
    const result = await fetchAthleteEventItemsAggregate(athleteId, params);

    if (result.error) {
      return resultError(result.error);
    }

    if (!result.data) {
      return resultError("Unable to load total");
    }

    return <EventsAggregateContent result={result.data} />;
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
