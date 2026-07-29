"use client";

import { format, isValid, parseISO } from "date-fns";
import { useEffect, useId, useRef, useState } from "react";
import { DayPicker, type Matcher } from "react-day-picker";

const dayPickerClassNames = {
  root: "p-1",
  months: "relative flex flex-col",
  month: "space-y-3",
  month_caption: "relative flex items-center justify-center px-10",
  caption_label: "hidden",
  dropdowns: "flex items-center gap-2",
  dropdown_root: "relative",
  dropdown:
    "appearance-none rounded-lg border border-white/10 bg-[#252b36] py-1.5 pl-3 pr-8 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20",
  chevron: "pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-zinc-300 transition hover:bg-[#2f3642] hover:text-white disabled:cursor-not-allowed disabled:opacity-40",
  button_next:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-zinc-300 transition hover:bg-[#2f3642] hover:text-white disabled:cursor-not-allowed disabled:opacity-40",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-center text-xs font-medium text-zinc-500",
  week: "mt-1 flex w-full",
  day: "relative h-9 w-9 p-0 text-center text-sm",
  day_button:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg font-normal text-zinc-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ec9e8]/40 disabled:pointer-events-none disabled:opacity-40",
  selected:
    "[&>button]:bg-[#9ec9e8] [&>button]:font-medium [&>button]:text-[#111827] [&>button]:hover:bg-[#b7d7ec]",
  today: "[&>button]:border [&>button]:border-[#9ec9e8]/45",
  outside: "[&>button]:text-zinc-600 [&>button]:opacity-50",
  disabled: "[&>button]:cursor-not-allowed [&>button]:text-zinc-600 [&>button]:opacity-30",
  hidden: "invisible",
};

type DatePickerInputProps = {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabledDates?: Matcher | Matcher[];
  fromYear?: number;
  toYear?: number;
};

function parseDateValue(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseISO(value);

  return isValid(parsed) ? parsed : undefined;
}

export function DatePickerInput({
  name,
  id,
  defaultValue,
  placeholder = "Select date",
  className,
  disabledDates,
  fromYear = 1920,
  toYear = new Date().getFullYear(),
}: DatePickerInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() => parseDateValue(defaultValue));

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node) || !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const formattedValue = selected ? format(selected, "yyyy-MM-dd") : "";
  const displayValue = selected ? format(selected, "MMM d, yyyy") : placeholder;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={formattedValue} />
      <button
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 text-left ${className ?? ""}`}
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>{displayValue}</span>
        <CalendarIcon />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] rounded-xl border border-white/10 bg-[#1c222c] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              setSelected(date);
              setOpen(false);
            }}
            defaultMonth={selected}
            captionLayout="dropdown"
            startMonth={new Date(fromYear, 0)}
            endMonth={new Date(toYear, 11)}
            disabled={disabledDates}
            classNames={dayPickerClassNames}
          />
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-zinc-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v2m8-2v2M4.5 9.5h15M6 5.5h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}
