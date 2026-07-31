"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import type { Sport } from "@/lib/types";

type SportSelectProps = {
  sports: Sport[];
};

function initialSportId(sports: Sport[]): string | null {
  if (sports.length === 0) {
    return null;
  }

  if (sports.length === 1) {
    return sports[0]?.id ?? null;
  }

  const hockey = sports.find((sport) => sport.slug === "hockey");
  return hockey?.id ?? null;
}

export function SportSelect({ sports }: SportSelectProps) {
  const t = useTranslations("onboarding.sportSelect");
  const tCommon = useTranslations("common");
  const [selectedSportId, setSelectedSportId] = useState<string | null>(() =>
    initialSportId(sports),
  );

  const selectedSport = sports.find((sport) => sport.id === selectedSportId) ?? null;
  const singleSport = sports.length === 1;

  if (sports.length === 0) {
    return (
      <p className="rounded-xl bg-[#2a1717] px-4 py-3 text-sm text-red-300">{t("noSports")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-300 lg:text-base">{t("title")}</p>

        {singleSport && selectedSport ? (
          <div className="rounded-xl border border-[#9ec9e8]/35 bg-[#1c222c] px-4 py-3 lg:px-5 lg:py-4">
            <p className="text-sm text-[#9ec9e8]">{tCommon("selected")}</p>
            <p className="mt-1 text-lg font-medium text-white lg:text-xl">{selectedSport.name}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sports.map((sport) => {
              const selected = sport.id === selectedSportId;

              return (
                <li key={sport.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSportId(sport.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition lg:py-3.5 ${
                      selected
                        ? "border-[#9ec9e8]/45 bg-[#1c222c] text-white"
                        : "border-white/10 bg-[#1c222c]/60 text-zinc-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">{sport.name}</span>
                    {selected ? (
                      <span className="text-sm text-[#9ec9e8]">{tCommon("selected")}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedSportId ? (
        <Link
          href={`/onboarding/athlete?sportId=${encodeURIComponent(selectedSportId)}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:py-3.5 lg:text-base"
        >
          {tCommon("continue")}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#b7d7ec]/40 px-4 py-3 text-sm font-medium text-[#1a2430]/60 lg:py-3.5 lg:text-base"
        >
          {tCommon("continue")}
        </button>
      )}
    </div>
  );
}
