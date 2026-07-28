import Link from "next/link";

import type { Sport } from "@/lib/types";

type MetricDefinitionFiltersProps = {
  sports: Sport[];
};

const inputClassName =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

export function MetricDefinitionFilters({ sports }: MetricDefinitionFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-slate-700">Sport</span>
        <select name="sportId" defaultValue="" className={`${inputClassName} w-full`}>
          <option value="">All sports</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </label>

      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-slate-700">Active</span>
        <select name="active" defaultValue="" className={`${inputClassName} w-full`}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto sm:py-2"
      >
        Apply filters
      </button>

      <Link
        href="/admin/metric-definitions"
        className="px-2 py-2 text-center text-sm text-slate-600 hover:text-slate-900 sm:text-left"
      >
        Clear
      </Link>
    </form>
  );
}
