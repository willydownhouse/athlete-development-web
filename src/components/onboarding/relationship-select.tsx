"use client";

import type { AthleteAccessRole } from "@/lib/types";

type RelationshipSelectProps = {
  value: AthleteAccessRole | null;
  onChange: (value: AthleteAccessRole) => void;
};

const options: Array<{
  value: AthleteAccessRole;
  title: string;
  description: string;
}> = [
  {
    value: "parent",
    title: "My child",
    description: "I am a parent setting up a profile for my child.",
  },
  {
    value: "athlete",
    title: "Myself",
    description: "I am creating a profile for my own development journey.",
  },
];

export function RelationshipSelect({ value, onChange }: RelationshipSelectProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300 lg:text-base">Who is this profile for?</p>
      <ul className="space-y-2">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => onChange(option.value)}
                className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left transition lg:px-5 lg:py-4 ${
                  selected
                    ? "border-[#9ec9e8]/45 bg-[#1c222c] text-white"
                    : "border-white/10 bg-[#1c222c]/60 text-zinc-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="font-medium">{option.title}</span>
                <span className="mt-1 text-sm text-zinc-400">{option.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
