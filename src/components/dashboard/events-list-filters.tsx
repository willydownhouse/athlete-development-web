"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type SubmitEvent } from "react";

import { DatePickerInput } from "@/components/date-picker-input";
import { FormMultiSelect } from "@/components/form/form-multi-select";
import type { FormSelectGroup } from "@/components/form/form-select";
import { PickerMenu } from "@/components/picker-menu";
import {
  buildEventsListQueryString,
  EVENTS_LIST_DEFAULT_LIMIT,
  EVENTS_LIST_DEFAULT_PAGE,
  EVENTS_LIST_DEFAULT_SHOW,
  EVENTS_LIST_PAGE_SIZE_OPTIONS,
  EVENTS_LIST_SHOW_OPTIONS,
  isEventsListMetricShow,
  type EventsListSearchParams,
  type EventsListShow,
} from "@/lib/events-list-params";
import { groupEventTypes } from "@/lib/event-type-groups";
import { numericMetricsForSelectedEventTypes } from "@/lib/events-list-metrics";
import {
  EVENT_CATEGORIES,
  formatCategoryLabel,
  type EventCategory,
  type EventType,
  type EventTypeMetricDefinition,
} from "@/lib/types";

type EventsListFiltersProps = {
  eventTypes: EventType[];
  eventTypeMetrics: EventTypeMetricDefinition[];
  focusSportName: string;
  params: EventsListSearchParams;
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export function EventsListFilters({
  eventTypes,
  eventTypeMetrics,
  focusSportName,
  params,
}: EventsListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState(params.from ?? "");
  const [to, setTo] = useState(params.to ?? "");
  const [eventTypeIds, setEventTypeIds] = useState(params.eventTypeIds);
  const [categories, setCategories] = useState<EventCategory[]>(params.categories);
  const [show, setShow] = useState<EventsListShow>(params.show);
  const [metricDefinitionId, setMetricDefinitionId] = useState(params.metricDefinitionId ?? "");
  const [limit, setLimit] = useState(String(params.limit));

  const eventTypeGroups = useMemo<FormSelectGroup[]>(
    () =>
      groupEventTypes(eventTypes, focusSportName).map((group) => ({
        label: group.label,
        options: group.items.map((eventType) => ({
          value: eventType.id,
          label: eventType.name,
        })),
      })),
    [eventTypes, focusSportName],
  );

  const metricOptions = useMemo(
    () =>
      numericMetricsForSelectedEventTypes(eventTypeMetrics, eventTypeIds).map((metric) => ({
        value: metric.id,
        label: metric.name,
      })),
    [eventTypeIds, eventTypeMetrics],
  );

  function setSelectedEventTypeIds(nextEventTypeIds: string[]) {
    setEventTypeIds(nextEventTypeIds);
    const nextMetricIds = new Set(
      numericMetricsForSelectedEventTypes(eventTypeMetrics, nextEventTypeIds).map(
        (metric) => metric.id,
      ),
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
    show: EventsListShow;
    metricDefinitionId: string;
    limit: string;
  }) {
    const parsedLimit = Number.parseInt(next.limit, 10);
    const query = buildEventsListQueryString({
      limit: Number.isFinite(parsedLimit) ? parsedLimit : EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: next.from || undefined,
      to: next.to || undefined,
      eventTypeIds: next.eventTypeIds,
      categories: next.categories,
      show: next.show,
      metricDefinitionId: next.metricDefinitionId || undefined,
      explicitDateRange: Boolean(next.from || next.to),
    });

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters({ from, to, eventTypeIds, categories, show, metricDefinitionId, limit });
  }

  function handleClear() {
    setFrom("");
    setTo("");
    setEventTypeIds([]);
    setCategories([]);
    setShow(EVENTS_LIST_DEFAULT_SHOW);
    setMetricDefinitionId("");
    setLimit(String(EVENTS_LIST_DEFAULT_LIMIT));
    router.replace(pathname, { scroll: false });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">From date</span>
          <DatePickerInput
            value={from}
            onChange={setFrom}
            placeholder="Select date"
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">To date</span>
          <DatePickerInput
            value={to}
            onChange={setTo}
            placeholder="Select date"
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Event types</span>
          <FormMultiSelect
            values={eventTypeIds}
            groups={eventTypeGroups}
            emptyLabel="All event types"
            placeholder="All event types"
            className={inputClassName}
            aria-label="Event types"
            onChange={setSelectedEventTypeIds}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Categories</span>
          <FormMultiSelect
            values={categories}
            options={EVENT_CATEGORIES.map((category) => ({
              value: category,
              label: formatCategoryLabel(category),
            }))}
            emptyLabel="All categories"
            placeholder="All categories"
            className={inputClassName}
            aria-label="Categories"
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
          <span className="font-medium text-zinc-300">Show</span>
          <PickerMenu
            value={show}
            onChange={(value) =>
              setShow(
                EVENTS_LIST_SHOW_OPTIONS.some((option) => option.value === value)
                  ? (value as EventsListShow)
                  : EVENTS_LIST_DEFAULT_SHOW,
              )
            }
            options={EVENTS_LIST_SHOW_OPTIONS}
            className={inputClassName}
            aria-label="Show"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span
            className={`font-medium ${isEventsListMetricShow(show) ? "text-zinc-300" : "text-zinc-500"}`}
          >
            Metric
          </span>
          <PickerMenu
            value={metricDefinitionId}
            options={metricOptions}
            placeholder="Select a metric"
            disabled={!isEventsListMetricShow(show)}
            onChange={setMetricDefinitionId}
            className={inputClassName}
            aria-label="Metric"
          />
        </label>

        {show === "events" ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">Page size</span>
            <PickerMenu
              value={limit}
              onChange={setLimit}
              options={EVENTS_LIST_PAGE_SIZE_OPTIONS.map((option) => ({
                value: String(option),
                label: `${option} events`,
              }))}
              className={inputClassName}
              aria-label="Page size"
            />
          </label>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-2.5 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] sm:w-auto"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] sm:w-auto"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
