"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type SubmitEvent } from "react";

import { DatePickerInput } from "@/components/date-picker-input";
import { FormMultiSelect } from "@/components/form/form-multi-select";
import type { FormSelectGroup } from "@/components/form/form-select";
import { PickerMenu } from "@/components/picker-menu";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { EVENT_ITEM_LABEL_MAX_LENGTH } from "@/lib/event-item-form";
import { groupEventTypes } from "@/lib/event-type-groups";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import {
  numericMetricsForEventsListMeasure,
  type ItemMeasureNumericMetrics,
} from "@/lib/events-list-metrics";
import {
  buildEventsListQueryString,
  eventsListItemMeasureListLabel,
  eventsListItemShowOptions,
  eventsListMeasureOptions,
  eventsListShowOptions,
  EVENTS_LIST_DEFAULT_ITEM_SHOW,
  EVENTS_LIST_DEFAULT_LIMIT,
  EVENTS_LIST_DEFAULT_MEASURE,
  EVENTS_LIST_DEFAULT_PAGE,
  EVENTS_LIST_DEFAULT_SHOW,
  EVENTS_LIST_PAGE_SIZE_OPTIONS,
  isEventsListExerciseMeasure,
  isEventsListItemListShow,
  isEventsListItemMeasure,
  isEventsListItemShow,
  isEventsListMetricShow,
  isEventsListPagedShow,
  normalizeEventsListLabel,
  type EventsListMeasure,
  type EventsListSearchParams,
  type EventsListShow,
} from "@/lib/events-list-params";
import { formatEventCategoryLabel } from "@/lib/enum-labels";
import {
  EVENT_CATEGORIES,
  type EventCategory,
  type EventItemType,
  type EventType,
  type EventTypeMetricDefinition,
} from "@/lib/types";

type EventsListFiltersProps = {
  eventTypes: EventType[];
  eventTypeMetrics: EventTypeMetricDefinition[];
  itemTypes: EventItemType[];
  itemMeasureMetrics: ItemMeasureNumericMetrics;
  focusSportName: string;
  params: EventsListSearchParams;
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";
const datePickerClassName =
  "h-9 w-full rounded-xl border border-white/10 bg-[#1c222c] px-2.5 text-xs text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 sm:h-10 sm:px-3 sm:text-sm";

export function EventsListFilters({
  eventTypes,
  eventTypeMetrics,
  itemTypes,
  itemMeasureMetrics,
  focusSportName,
  params,
}: EventsListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState(params.from ?? "");
  const [to, setTo] = useState(params.to ?? "");
  const [eventTypeIds, setEventTypeIds] = useState(params.eventTypeIds);
  const [categories, setCategories] = useState<EventCategory[]>(params.categories);
  const [measure, setMeasure] = useState<EventsListMeasure>(params.measure);
  const [show, setShow] = useState<EventsListShow>(params.show);
  const [metricDefinitionId, setMetricDefinitionId] = useState(params.metricDefinitionId ?? "");
  const [label, setLabel] = useState(params.label ?? "");
  const [limit, setLimit] = useState(String(params.limit));
  const locale = useAppLocale();
  const messages = getMessages(locale);
  const measureOptions = eventsListMeasureOptions(locale);
  const showOptions = eventsListShowOptions(locale);

  const eventTypeGroups = useMemo<FormSelectGroup[]>(
    () =>
      groupEventTypes(eventTypes, focusSportName, locale).map((group) => ({
        label: group.label,
        options: group.items.map((eventType) => ({
          value: eventType.id,
          label: eventType.name,
        })),
      })),
    [eventTypes, focusSportName, locale],
  );

  const itemShowOptions = useMemo(
    () =>
      isEventsListItemMeasure(measure)
        ? eventsListItemShowOptions(
            eventsListItemMeasureListLabel(itemTypes, measure, undefined, locale),
            locale,
          )
        : showOptions,
    [itemTypes, locale, measure, showOptions],
  );

  const metricOptions = useMemo(() => {
    return numericMetricsForEventsListMeasure(
      measure,
      itemMeasureMetrics,
      eventTypeMetrics,
      eventTypeIds,
      locale,
    ).map((metric) => ({
      value: metric.id,
      label: metric.name,
    }));
  }, [eventTypeIds, eventTypeMetrics, itemMeasureMetrics, locale, measure]);

  function setSelectedEventTypeIds(nextEventTypeIds: string[]) {
    setEventTypeIds(nextEventTypeIds);
    const nextMetricIds = new Set(
      numericMetricsForEventsListMeasure(
        measure,
        itemMeasureMetrics,
        eventTypeMetrics,
        nextEventTypeIds,
        locale,
      ).map((metric) => metric.id),
    );

    if (metricDefinitionId && !nextMetricIds.has(metricDefinitionId)) {
      setMetricDefinitionId("");
    }
  }

  function setSelectedMeasure(nextMeasure: EventsListMeasure) {
    setMeasure(nextMeasure);

    if (isEventsListItemMeasure(nextMeasure)) {
      if (!isEventsListItemShow(show)) {
        setShow(EVENTS_LIST_DEFAULT_ITEM_SHOW);
      }
    } else if (isEventsListItemListShow(show)) {
      setShow(EVENTS_LIST_DEFAULT_SHOW);
    }

    if (!isEventsListExerciseMeasure(nextMeasure)) {
      setLabel("");
    }

    const nextMetricIds = new Set(
      numericMetricsForEventsListMeasure(
        nextMeasure,
        itemMeasureMetrics,
        eventTypeMetrics,
        eventTypeIds,
        locale,
      ).map((metric) => metric.id),
    );

    if (metricDefinitionId && !nextMetricIds.has(metricDefinitionId)) {
      setMetricDefinitionId("");
    }
  }

  function applyFilters(next: {
    from: string;
    to: string;
    eventTypeIds: string[];
    categories: EventCategory[];
    measure: EventsListMeasure;
    show: EventsListShow;
    metricDefinitionId: string;
    label: string;
    limit: string;
  }) {
    const parsedLimit = Number.parseInt(next.limit, 10);
    const itemMeasure = isEventsListItemMeasure(next.measure);
    const nextShow =
      itemMeasure && !isEventsListItemShow(next.show) ? EVENTS_LIST_DEFAULT_ITEM_SHOW : next.show;
    const query = buildEventsListQueryString({
      limit: Number.isFinite(parsedLimit) ? parsedLimit : EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: next.from || undefined,
      to: next.to || undefined,
      eventTypeIds: next.eventTypeIds,
      categories: next.categories,
      measure: next.measure,
      show: nextShow,
      metricDefinitionId: isEventsListMetricShow(nextShow)
        ? next.metricDefinitionId || undefined
        : undefined,
      label: isEventsListExerciseMeasure(next.measure)
        ? normalizeEventsListLabel(next.label)
        : undefined,
      explicitDateRange: Boolean(next.from || next.to),
    });

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters({
      from,
      to,
      eventTypeIds,
      categories,
      measure,
      show,
      metricDefinitionId,
      label,
      limit,
    });
  }

  function handleClear() {
    setFrom("");
    setTo("");
    setEventTypeIds([]);
    setCategories([]);
    setMeasure(EVENTS_LIST_DEFAULT_MEASURE);
    setShow(EVENTS_LIST_DEFAULT_SHOW);
    setMetricDefinitionId("");
    setLabel("");
    setLimit(String(EVENTS_LIST_DEFAULT_LIMIT));
    router.replace(pathname, { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-[#171b22] p-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 [&>*]:min-w-0">
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{messages.events.fromDate}</span>
          <DatePickerInput
            value={from}
            onChange={setFrom}
            placeholder={messages.common.date}
            compact
            className={datePickerClassName}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{messages.events.toDate}</span>
          <DatePickerInput
            value={to}
            onChange={setTo}
            placeholder={messages.common.date}
            compact
            className={datePickerClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{messages.events.eventTypes}</span>
          <FormMultiSelect
            values={eventTypeIds}
            groups={eventTypeGroups}
            emptyLabel={messages.events.allEventTypes}
            placeholder={messages.events.allEventTypes}
            className={inputClassName}
            aria-label={messages.events.eventTypes}
            onChange={setSelectedEventTypeIds}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{messages.events.categories}</span>
          <FormMultiSelect
            values={categories}
            options={EVENT_CATEGORIES.map((category) => ({
              value: category,
              label: formatEventCategoryLabel(category, locale),
            }))}
            emptyLabel={messages.events.allCategories}
            placeholder={messages.events.allCategories}
            className={inputClassName}
            aria-label={messages.events.categories}
            onChange={(values) =>
              setCategories(
                values.filter((value): value is EventCategory =>
                  EVENT_CATEGORIES.includes(value as EventCategory),
                ),
              )
            }
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{messages.events.measure}</span>
          <PickerMenu
            value={measure}
            onChange={(value) =>
              setSelectedMeasure(
                measureOptions.some((option) => option.value === value)
                  ? (value as EventsListMeasure)
                  : EVENTS_LIST_DEFAULT_MEASURE,
              )
            }
            options={measureOptions}
            className={inputClassName}
            aria-label={messages.events.measure}
          />
        </label>

        {isEventsListExerciseMeasure(measure) ? (
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-1.5">
              <label htmlFor="exercise-name" className="font-medium text-zinc-300">
                {messages.events.exerciseName}
              </label>
              <InfoTooltip label={messages.events.exerciseNameTooltip}>
                <div className="space-y-2 text-sm text-zinc-300">
                  <p>
                    {messages.events.exerciseNameHelpPrefix}{" "}
                    <span className="font-medium text-white">
                      {messages.events.exerciseNameHelpExample}
                    </span>{" "}
                    {messages.events.exerciseNameHelpSuffix}
                  </p>
                  <p>{messages.events.exerciseNameHelpTotals}</p>
                </div>
              </InfoTooltip>
            </div>
            <input
              id="exercise-name"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={EVENT_ITEM_LABEL_MAX_LENGTH}
              required
              placeholder={messages.events.exerciseNamePlaceholder}
              className={inputClassName}
              aria-label={messages.events.exerciseNameAria}
            />
          </div>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">{messages.events.show}</span>
          <PickerMenu
            value={show}
            onChange={(value) => {
              setShow(
                itemShowOptions.some((option) => option.value === value)
                  ? (value as EventsListShow)
                  : isEventsListItemMeasure(measure)
                    ? EVENTS_LIST_DEFAULT_ITEM_SHOW
                    : EVENTS_LIST_DEFAULT_SHOW,
              );
            }}
            options={itemShowOptions}
            className={inputClassName}
            aria-label={messages.events.show}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span
            className={`font-medium ${isEventsListMetricShow(show) ? "text-zinc-300" : "text-zinc-500"}`}
          >
            {messages.events.metric}
          </span>
          <PickerMenu
            value={metricDefinitionId}
            options={metricOptions}
            placeholder={messages.events.selectMetric}
            disabled={!isEventsListMetricShow(show)}
            onChange={setMetricDefinitionId}
            className={inputClassName}
            aria-label={messages.events.metric}
          />
        </label>

        {isEventsListPagedShow(measure, show) ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">{messages.events.pageSize}</span>
            <PickerMenu
              value={limit}
              onChange={setLimit}
              options={EVENTS_LIST_PAGE_SIZE_OPTIONS.map((option) => ({
                value: String(option),
                label: `${option} ${
                  isEventsListItemMeasure(measure)
                    ? eventsListItemMeasureListLabel(
                        itemTypes,
                        measure,
                        undefined,
                        locale,
                      ).toLowerCase()
                    : messages.events.pageSizeEvents
                }`,
              }))}
              className={inputClassName}
              aria-label={messages.events.pageSize}
            />
          </label>
        ) : null}
      </div>

      <div className="flex flex-row items-center gap-3">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-2.5 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] sm:flex-none"
        >
          {messages.events.applyFilters}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] sm:flex-none"
        >
          {messages.events.clear}
        </button>
      </div>
    </form>
  );
}
