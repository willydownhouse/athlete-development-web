"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";

import { dayPickerClassNames } from "@/components/day-picker-styles";
import { dateFnsLocale } from "@/lib/date-fns-locale";
import { localDateKey } from "@/lib/event-grouping";
import { EVENT_TONE_BG_CLASS, type EventTone } from "@/lib/event-tone";
import { useAppLocale } from "@/lib/locale-context";

const CalendarEventTonesContext = createContext<Map<string, EventTone[]>>(new Map());

type CalendarMonthGridProps = {
  month: Date;
  selected: Date;
  onSelect: (date: Date) => void;
  eventTonesByDate: Map<string, EventTone[]>;
};

function toneRows(tones: EventTone[]): EventTone[][] {
  if (tones.length <= 4) {
    return [tones];
  }

  const firstCount = Math.ceil(tones.length / 2);
  return [tones.slice(0, firstCount), tones.slice(firstCount)];
}

function CalendarDayButton({
  day,
  modifiers,
  children,
  className,
  ...buttonProps
}: DayButtonProps) {
  const tonesByDate = useContext(CalendarEventTonesContext);
  const tones = tonesByDate.get(localDateKey(day.date)) ?? [];
  const rows = toneRows(tones);
  const focused = Boolean(modifiers["focused"]);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focused) {
      ref.current?.focus();
    }
  }, [focused]);

  return (
    <button ref={ref} {...buttonProps} type="button" className={`${className ?? ""} relative`}>
      {children}
      {tones.length > 0 ? (
        <span
          aria-hidden
          className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5"
        >
          {rows.map((row) => (
            <span key={row.join("-")} className="flex gap-0.5">
              {row.map((tone) => (
                <span
                  key={tone}
                  className={`h-1.5 rounded-full ${tones.length === 1 ? "w-5" : "w-1.5"} ${EVENT_TONE_BG_CLASS[tone]}`}
                />
              ))}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
}

export function CalendarMonthGrid({
  month,
  selected,
  onSelect,
  eventTonesByDate,
}: CalendarMonthGridProps) {
  const locale = useAppLocale();

  return (
    <CalendarEventTonesContext.Provider value={eventTonesByDate}>
      <DayPicker
        mode="single"
        locale={dateFnsLocale(locale)}
        month={month}
        hideNavigation
        weekStartsOn={1}
        selected={selected}
        onSelect={(date) => {
          if (date) {
            onSelect(date);
          }
        }}
        showOutsideDays
        fixedWeeks
        classNames={{
          ...dayPickerClassNames,
          root: `${dayPickerClassNames.root} w-full`,
          month_caption: "hidden",
          nav: "hidden",
          day_button: `${dayPickerClassNames.day_button} items-start pt-1`,
          selected:
            "[&>button]:bg-[#2e3642] [&>button]:font-medium [&>button]:text-white [&>button]:hover:bg-[#38414f]",
        }}
        components={{
          DayButton: CalendarDayButton,
        }}
      />
    </CalendarEventTonesContext.Provider>
  );
}
