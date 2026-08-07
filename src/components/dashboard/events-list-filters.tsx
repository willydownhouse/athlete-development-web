"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { DatePickerInput } from "@/components/date-picker-input";
import { FormSelect, type FormSelectGroup } from "@/components/form/form-select";
import { PickerMenu } from "@/components/picker-menu";
import {
  EVENTS_LIST_DEFAULT_LIMIT,
  EVENTS_LIST_PAGE_SIZE_OPTIONS,
  type EventsListSearchParams,
} from "@/lib/events-list-params";
import { groupEventTypes } from "@/lib/event-type-groups";
import type { EventType } from "@/lib/types";

type EventsListFiltersProps = {
  eventTypes: EventType[];
  focusSportName: string;
  params: EventsListSearchParams;
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export function EventsListFilters({ eventTypes, focusSportName, params }: EventsListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState(params.from ?? "");
  const [to, setTo] = useState(params.to ?? "");
  const [eventTypeId, setEventTypeId] = useState(params.eventTypeId ?? "");
  const [limit, setLimit] = useState(String(params.limit));

  const eventTypeGroups = useMemo<FormSelectGroup[]>(
    () => [
      {
        label: "All",
        options: [{ value: "", label: "All event types" }],
      },
      ...groupEventTypes(eventTypes, focusSportName).map((group) => ({
        label: group.label,
        options: group.items.map((eventType) => ({
          value: eventType.id,
          label: eventType.name,
        })),
      })),
    ],
    [eventTypes, focusSportName],
  );

  function applyFilters(next: { from: string; to: string; eventTypeId: string; limit: string }) {
    const search = new URLSearchParams();

    const parsedLimit = Number.parseInt(next.limit, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit !== EVENTS_LIST_DEFAULT_LIMIT) {
      search.set("limit", String(parsedLimit));
    }

    if (next.from) {
      search.set("from", next.from);
    }

    if (next.to) {
      search.set("to", next.to);
    }

    if (next.eventTypeId) {
      search.set("eventTypeId", next.eventTypeId);
    }

    const query = search.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters({ from, to, eventTypeId, limit });
  }

  function handleClear() {
    setFrom("");
    setTo("");
    setEventTypeId("");
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
          <span className="font-medium text-zinc-300">Event type</span>
          <FormSelect
            value={eventTypeId}
            onChange={setEventTypeId}
            groups={eventTypeGroups}
            placeholder="All event types"
            className={inputClassName}
          />
        </label>

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
