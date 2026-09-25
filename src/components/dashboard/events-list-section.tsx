import { EventItemsListContent } from "@/components/dashboard/event-items-list-content";
import { EventsAggregateContent } from "@/components/dashboard/events-aggregate-content";
import { EventsListContent } from "@/components/dashboard/events-list-content";
import { eventsAggregateHeading } from "@/lib/events-aggregate-format";
import {
  fetchAthleteEventItemsAggregate,
  fetchAthleteEventItemsList,
  fetchAthleteEventsAggregate,
  fetchAthleteEventsList,
} from "@/lib/events-list-data";
import { itemMeasureChildNoun } from "@/lib/events-list-metrics";
import {
  eventsListItemMeasureListLabel,
  isEventsListAggregateShow,
  isEventsListExerciseMeasure,
  isEventsListItemListShow,
  isEventsListItemMeasure,
  isEventsListMetricShow,
  type EventsListSearchParams,
} from "@/lib/events-list-params";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { EventItemType, EventItemTypeChildType } from "@/lib/types";

type EventsListSectionProps = {
  athleteId: string;
  timeZone: string;
  params: EventsListSearchParams;
  itemTypes: EventItemType[];
  itemTypeChildTypes: EventItemTypeChildType[];
};

function resultError(message: string) {
  return <p className="rounded-2xl bg-[#2a1717] px-4 py-3 text-sm text-red-300">{message}</p>;
}

export async function EventsListSection({
  athleteId,
  timeZone,
  params,
  itemTypes,
  itemTypeChildTypes,
}: EventsListSectionProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  if (isEventsListExerciseMeasure(params.measure) && !params.label) {
    const heading = isEventsListItemListShow(params.show)
      ? eventsListItemMeasureListLabel(itemTypes, params.measure, undefined, locale)
      : eventsAggregateHeading(
          isEventsListAggregateShow(params.show) ? params.show : "count",
          "exercise",
          locale,
        );

    return (
      <section className="rounded-2xl bg-[#171b22] px-4 py-4">
        <h2 className="text-base font-semibold text-white">{heading}</h2>
        <p className="mt-4 text-sm text-zinc-500">{messages.events.enterExerciseName}</p>
      </section>
    );
  }

  if (isEventsListItemMeasure(params.measure)) {
    if (isEventsListItemListShow(params.show)) {
      const result = await fetchAthleteEventItemsList(athleteId, params, itemTypes);

      if (result.error) {
        return resultError(result.error);
      }

      if (!result.data) {
        return resultError(messages.actions.loadItems);
      }

      return (
        <EventItemsListContent
          athleteId={athleteId}
          params={params}
          items={result.data.items}
          timeZone={timeZone}
          total={result.data.pagination.total}
          heading={eventsListItemMeasureListLabel(itemTypes, params.measure, undefined, locale)}
          locale={locale}
        />
      );
    }

    if (isEventsListMetricShow(params.show) && !params.metricDefinitionId) {
      return (
        <section className="rounded-2xl bg-[#171b22] px-4 py-4">
          <h2 className="text-base font-semibold text-white">
            {params.show === "metricAverage"
              ? messages.events.showMetricAverage
              : messages.events.showMetricTotal}
          </h2>
          <p className="mt-4 text-sm text-zinc-500">{messages.events.selectMetric}</p>
        </section>
      );
    }
    const result = await fetchAthleteEventItemsAggregate(athleteId, params, itemTypes);

    if (result.error) {
      return resultError(result.error);
    }

    if (!result.data) {
      return resultError(messages.actions.loadTotal);
    }

    return (
      <EventsAggregateContent
        result={result.data}
        locale={locale}
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
      <section className="rounded-2xl bg-[#171b22] px-4 py-4">
        <h2 className="text-base font-semibold text-white">
          {params.show === "metricAverage"
            ? messages.events.showMetricAverage
            : messages.events.showMetricTotal}
        </h2>
        <p className="mt-4 text-sm text-zinc-500">{messages.events.selectMetric}</p>
      </section>
    );
  }

  if (isEventsListAggregateShow(params.show)) {
    const result = await fetchAthleteEventsAggregate(athleteId, params);

    if (result.error) {
      return resultError(result.error);
    }

    if (!result.data) {
      return resultError(messages.actions.loadTotal);
    }

    return <EventsAggregateContent result={result.data} locale={locale} />;
  }

  const result = await fetchAthleteEventsList(athleteId, params);

  if (result.error) {
    return resultError(result.error);
  }

  if (!result.data) {
    return resultError(messages.actions.loadEvents);
  }

  return (
    <EventsListContent
      athleteId={athleteId}
      params={params}
      events={result.data.items}
      timeZone={timeZone}
      total={result.data.pagination.total}
      locale={locale}
    />
  );
}
