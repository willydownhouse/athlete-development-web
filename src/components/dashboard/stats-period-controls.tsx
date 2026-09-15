"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";

import { DatePickerInput } from "@/components/date-picker-input";
import { athleteStatsCustomHref, athleteStatsHref } from "@/components/dashboard/dashboard-nav";
import type { StatsSearchParams } from "@/lib/stats-params";

const PRESET_OPTIONS: Array<{
  value: StatsSearchParams["period"];
  label: string;
  shortLabel: string;
}> = [
  { value: "week", label: "This week", shortLabel: "Week" },
  { value: "month", label: "This month", shortLabel: "Month" },
  { value: "year", label: "This year", shortLabel: "Year" },
];

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

const tabClassName = (active: boolean) =>
  "rounded-md px-2 py-1 text-xs font-medium transition-colors sm:px-2.5 " +
  (active ? "bg-[#9ec9e8] text-[#171b22]" : "text-zinc-400 hover:text-white");

type StatsPeriodControlsProps = {
  athleteId: string;
  params: StatsSearchParams;
  rangeFrom: string;
  rangeTo: string;
};

export function StatsPeriodControls({
  athleteId,
  params,
  rangeFrom,
  rangeTo,
}: StatsPeriodControlsProps) {
  const router = useRouter();
  const isCustom = params.explicitDateRange;
  const [from, setFrom] = useState(params.from ?? rangeFrom);
  const [to, setTo] = useState(params.to ?? rangeTo);
  const currentYear = new Date().getFullYear();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!from || !to) {
      return;
    }

    const nextFrom = from <= to ? from : to;
    const nextTo = from <= to ? to : from;
    router.replace(athleteStatsCustomHref(athleteId, nextFrom, nextTo), { scroll: false });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex shrink-0 rounded-lg bg-white/5 p-0.5">
          {PRESET_OPTIONS.map((option) => {
            const isActive = !isCustom && option.value === params.period;
            const label = (
              <>
                <span className="sm:hidden">{option.shortLabel}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </>
            );

            if (isActive) {
              return (
                <span
                  key={option.value}
                  aria-current="page"
                  aria-label={option.label}
                  className={tabClassName(true)}
                >
                  {label}
                </span>
              );
            }

            return (
              <Link
                key={option.value}
                href={athleteStatsHref(athleteId, option.value)}
                aria-label={option.label}
                className={tabClassName(false)}
              >
                {label}
              </Link>
            );
          })}
          {isCustom ? (
            <span aria-current="page" aria-label="Custom range" className={tabClassName(true)}>
              Custom
            </span>
          ) : (
            <Link
              href={athleteStatsCustomHref(athleteId, rangeFrom, rangeTo)}
              aria-label="Custom range"
              className={tabClassName(false)}
            >
              Custom
            </Link>
          )}
        </div>
      </div>

      {isCustom ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-300">From date</span>
              <DatePickerInput
                value={from}
                onChange={setFrom}
                placeholder="Select date"
                className={inputClassName}
                fromYear={currentYear - 5}
                toYear={currentYear}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-300">To date</span>
              <DatePickerInput
                value={to}
                onChange={setTo}
                placeholder="Select date"
                className={inputClassName}
                fromYear={currentYear - 5}
                toYear={currentYear}
              />
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-2.5 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] sm:w-auto"
          >
            Apply dates
          </button>
        </form>
      ) : null}
    </div>
  );
}
