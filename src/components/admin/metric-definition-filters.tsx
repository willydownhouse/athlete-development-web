"use client";

import Link from "next/link";

import {
  ACTIVE_FILTER_OPTIONS,
  AdminFormSelect,
  sportFilterOptions,
} from "@/components/admin/admin-form-select";
import type { Sport } from "@/lib/types";

type MetricDefinitionFiltersProps = {
  sports: Sport[];
  defaultSportId?: string;
  defaultActive?: string;
};

export function MetricDefinitionFilters({
  sports,
  defaultSportId = "",
  defaultActive = "",
}: MetricDefinitionFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-zinc-300">Sport</span>
        <AdminFormSelect
          name="sportId"
          defaultValue={defaultSportId}
          options={sportFilterOptions(sports)}
        />
      </label>

      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-zinc-300">Active</span>
        <AdminFormSelect
          name="active"
          defaultValue={defaultActive}
          options={ACTIVE_FILTER_OPTIONS}
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#b7d7ec] px-4 py-2.5 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] sm:w-auto sm:py-2"
      >
        Apply filters
      </button>

      <Link
        href="/admin/metric-definitions"
        className="px-2 py-2 text-center text-sm text-zinc-400 hover:text-white sm:text-left"
      >
        Clear
      </Link>
    </form>
  );
}
