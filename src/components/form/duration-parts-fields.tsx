import type { ReactNode } from "react";

type DurationPartsFieldsProps = {
  hoursName: string;
  minutesName: string;
  secondsName: string;
  defaultHours?: string;
  defaultMinutes?: string;
  defaultSeconds?: string;
  label: ReactNode;
  description?: ReactNode;
  inputClassName?: string;
};

const defaultInputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export function DurationPartsFields({
  hoursName,
  minutesName,
  secondsName,
  defaultHours = "",
  defaultMinutes = "",
  defaultSeconds = "",
  label,
  description,
  inputClassName = defaultInputClassName,
}: DurationPartsFieldsProps) {
  return (
    <div className="space-y-2 text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Hours</span>
          <input
            name={hoursName}
            type="number"
            min={0}
            defaultValue={defaultHours}
            placeholder="0"
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Minutes</span>
          <input
            name={minutesName}
            type="number"
            min={0}
            max={59}
            defaultValue={defaultMinutes}
            placeholder="0"
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Seconds</span>
          <input
            name={secondsName}
            type="number"
            min={0}
            max={59}
            defaultValue={defaultSeconds}
            placeholder="0"
            className={inputClassName}
          />
        </label>
      </div>
      {description ? <span className="text-xs text-zinc-500">{description}</span> : null}
    </div>
  );
}
