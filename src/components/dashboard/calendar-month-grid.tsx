"use client";

import { DayPicker } from "react-day-picker";

import { dayPickerClassNames } from "@/components/day-picker-styles";

const calendarHasEventsClass =
  "[&:not([data-selected=true])>button]:bg-[#3d5266] [&:not([data-selected=true])>button]:font-medium [&:not([data-selected=true])>button]:text-zinc-100 [&:not([data-selected=true])>button]:hover:bg-[#4a6278]";

type CalendarMonthGridProps = {
  month: Date;
  selected: Date;
  onSelect: (date: Date) => void;
  daysWithEvents: Date[];
};

export function CalendarMonthGrid({
  month,
  selected,
  onSelect,
  daysWithEvents,
}: CalendarMonthGridProps) {
  return (
    <DayPicker
      mode="single"
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
      }}
      modifiers={{ has_events: daysWithEvents }}
      modifiersClassNames={{
        has_events: calendarHasEventsClass,
      }}
    />
  );
}
