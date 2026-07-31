import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Sport } from "@/lib/types";

type EventTypeFiltersProps = {
  sports: Sport[];
};

const inputClassName =
  "rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export async function EventTypeFilters({ sports }: EventTypeFiltersProps) {
  const tCommon = await getTranslations("common");

  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-zinc-300">{tCommon("sport")}</span>
        <select name="sportId" defaultValue="" className={`${inputClassName} w-full`}>
          <option value="">{tCommon("allSports")}</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </label>

      <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[10rem]">
        <span className="font-medium text-zinc-300">{tCommon("status")}</span>
        <select name="active" defaultValue="" className={`${inputClassName} w-full`}>
          <option value="">{tCommon("all")}</option>
          <option value="true">{tCommon("active")}</option>
          <option value="false">{tCommon("inactive")}</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#b7d7ec] px-4 py-2.5 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] sm:w-auto sm:py-2"
      >
        {tCommon("applyFilters")}
      </button>

      <Link
        href="/admin/event-types"
        className="px-2 py-2 text-center text-sm text-zinc-400 hover:text-white sm:text-left"
      >
        {tCommon("clear")}
      </Link>
    </form>
  );
}
