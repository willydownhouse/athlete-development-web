"use client";

import { useState } from "react";

type OptionPill = {
  value: string;
  label: string;
};

type OptionPillsProps = {
  name: string;
  options: OptionPill[];
  defaultValue?: string;
};

export function OptionPills({ name, options, defaultValue = "" }: OptionPillsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value || "empty"}
              type="button"
              aria-pressed={selected}
              onClick={() => setValue(option.value)}
              className={
                selected
                  ? "rounded-full bg-[#b7d7ec] px-3.5 py-2 text-sm font-semibold text-[#1a2430]"
                  : "rounded-full border border-white/10 bg-[#1c222c] px-3.5 py-2 text-sm font-medium text-zinc-300 transition hover:bg-[#252b36] hover:text-zinc-100"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
