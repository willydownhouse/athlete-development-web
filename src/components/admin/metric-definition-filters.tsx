import Link from "next/link";

import type { Sport } from "@/lib/types";

type MetricDefinitionFiltersProps = {
  sports: Sport[];
};

const inputClassName =
  "rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export function MetricDefinitionFilters({ sports }: MetricDefinitionFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-zinc-300">Sport</span>
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
        <span className="font-medium text-zinc-300">Active</span>
        <select name="active" defaultValue="" className={`${inputClassName} w-full`}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
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
