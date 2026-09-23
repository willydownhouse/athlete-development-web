import {
  fetchEventAggregate,
  fetchEventItemAggregate,
  fetchEventItems,
  fetchEvents,
} from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import {
  eventsListDateRange,
  eventsListMeasureLabel,
  isEventsListAggregateShow,
  isEventsListExerciseMeasure,
  isEventsListItemMeasure,
  isEventsListMetricShow,
  resolveEventsListItemTypeId,
  type EventsListSearchParams,
} from "@/lib/events-list-params";
import { getMessages } from "@/lib/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type {
  EventAggregate,
  EventItemAggregate,
  EventItemListResponse,
  EventItemType,
  EventListResponse,
} from "@/lib/types";

type EventsListResult =
  { data: EventListResponse; error?: undefined } | { data?: undefined; error: string };

type EventsAggregateResult =
  { data: EventAggregate; error?: undefined } | { data?: undefined; error: string };

type EventItemsAggregateResult =
  { data: EventItemAggregate; error?: undefined } | { data?: undefined; error: string };

type EventItemsListResult =
  { data: EventItemListResponse; error?: undefined } | { data?: undefined; error: string };

export async function fetchAthleteEventsList(
  athleteId: string,
  params: EventsListSearchParams,
): Promise<EventsListResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const [timeZone, locale] = await Promise.all([getRequestTimeZone(), getRequestLocale()]);
  const dateRange = eventsListDateRange(timeZone, params.from, params.to);

  try {
    const data = await fetchEvents(token, athleteId, {
      limit: params.limit,
      offset: params.offset,
      ...dateRange,
      ...(params.eventTypeIds.length > 0 ? { eventTypeIds: params.eventTypeIds } : {}),
      ...(params.categories.length > 0 ? { categories: params.categories } : {}),
      locale,
    });

    return { data };
  } catch (error) {
    return { error: passthroughOrGeneric(error, actions.loadEvents) };
  }
}

export async function fetchAthleteEventsAggregate(
  athleteId: string,
  params: EventsListSearchParams,
): Promise<EventsAggregateResult> {
  const [token, locale] = await Promise.all([getAuthBearerToken(), getRequestLocale()]);
  const messages = getMessages(locale);
  const actions = messages.actions;

  if (!isEventsListAggregateShow(params.show)) {
    return { error: actions.chooseTotalToShow };
  }

  if (isEventsListMetricShow(params.show) && !params.metricDefinitionId) {
    return { error: messages.events.selectMetric };
  }

  if (!token) {
    return { error: actions.signInAgain };
  }

  const timeZone = await getRequestTimeZone();
  const dateRange = eventsListDateRange(timeZone, params.from, params.to);

  if (!dateRange.startedAtFrom || !dateRange.startedAtTo) {
    return { error: actions.chooseDateRange };
  }

  try {
    const data = await fetchEventAggregate(token, athleteId, {
      startedAtFrom: dateRange.startedAtFrom,
      startedAtTo: dateRange.startedAtTo,
      aggregation: params.show,
      ...(params.eventTypeIds.length > 0 ? { eventTypeIds: params.eventTypeIds } : {}),
      ...(params.categories.length > 0 ? { categories: params.categories } : {}),
      ...(isEventsListMetricShow(params.show) && params.metricDefinitionId
        ? { metricDefinitionId: params.metricDefinitionId }
        : {}),
    });

    return { data };
  } catch (error) {
    return { error: passthroughOrGeneric(error, actions.loadTotal) };
  }
}

export async function fetchAthleteEventItemsAggregate(
  athleteId: string,
  params: EventsListSearchParams,
  itemTypes: EventItemType[],
): Promise<EventItemsAggregateResult> {
  const [token, locale] = await Promise.all([getAuthBearerToken(), getRequestLocale()]);
  const messages = getMessages(locale);
  const actions = messages.actions;

  if (!isEventsListItemMeasure(params.measure) || !isEventsListAggregateShow(params.show)) {
    return { error: actions.chooseTotalToShow };
  }

  if (isEventsListExerciseMeasure(params.measure) && !params.label) {
    return { error: messages.events.enterExerciseName };
  }

  if (isEventsListMetricShow(params.show) && !params.metricDefinitionId) {
    return { error: messages.events.selectMetric };
  }

  if (!token) {
    return { error: actions.signInAgain };
  }

  const timeZone = await getRequestTimeZone();
  const dateRange = eventsListDateRange(timeZone, params.from, params.to);

  if (!dateRange.startedAtFrom || !dateRange.startedAtTo) {
    return { error: actions.chooseDateRange };
  }

  try {
    const eventItemTypeId = resolveEventsListItemTypeId(itemTypes, params.measure);

    if (!eventItemTypeId) {
      return {
        error: actions.measureNotAvailable(eventsListMeasureLabel(params.measure, locale)),
      };
    }

    const data = await fetchEventItemAggregate(token, athleteId, {
      startedAtFrom: dateRange.startedAtFrom,
      startedAtTo: dateRange.startedAtTo,
      eventItemTypeId,
      aggregation: params.show,
      ...(params.eventTypeIds.length > 0 ? { eventTypeIds: params.eventTypeIds } : {}),
      ...(params.categories.length > 0 ? { categories: params.categories } : {}),
      ...(isEventsListExerciseMeasure(params.measure) && params.label
        ? { label: params.label }
        : {}),
      ...(isEventsListMetricShow(params.show) && params.metricDefinitionId
        ? { metricDefinitionId: params.metricDefinitionId }
        : {}),
    });

    return { data };
  } catch (error) {
    return { error: passthroughOrGeneric(error, actions.loadTotal) };
  }
}

export async function fetchAthleteEventItemsList(
  athleteId: string,
  params: EventsListSearchParams,
  itemTypes: EventItemType[],
): Promise<EventItemsListResult> {
  const [token, locale] = await Promise.all([getAuthBearerToken(), getRequestLocale()]);
  const messages = getMessages(locale);
  const actions = messages.actions;

  if (!isEventsListItemMeasure(params.measure)) {
    return { error: actions.chooseItemsToShow };
  }

  if (isEventsListExerciseMeasure(params.measure) && !params.label) {
    return { error: messages.events.enterExerciseName };
  }

  if (!token) {
    return { error: actions.signInAgain };
  }

  const timeZone = await getRequestTimeZone();
  const dateRange = eventsListDateRange(timeZone, params.from, params.to);

  if (!dateRange.startedAtFrom || !dateRange.startedAtTo) {
    return { error: actions.chooseDateRange };
  }

  try {
    const eventItemTypeId = resolveEventsListItemTypeId(itemTypes, params.measure);

    if (!eventItemTypeId) {
      return {
        error: actions.measureNotAvailable(eventsListMeasureLabel(params.measure, locale)),
      };
    }

    const data = await fetchEventItems(token, athleteId, {
      startedAtFrom: dateRange.startedAtFrom,
      startedAtTo: dateRange.startedAtTo,
      eventItemTypeId,
      limit: params.limit,
      offset: params.offset,
      ...(params.eventTypeIds.length > 0 ? { eventTypeIds: params.eventTypeIds } : {}),
      ...(params.categories.length > 0 ? { categories: params.categories } : {}),
      ...(isEventsListExerciseMeasure(params.measure) && params.label
        ? { label: params.label }
        : {}),
      locale,
    });

    return { data };
  } catch (error) {
    return { error: passthroughOrGeneric(error, actions.loadItems) };
  }
}
