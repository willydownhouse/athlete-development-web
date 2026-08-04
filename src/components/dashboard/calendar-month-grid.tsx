"use client";

import { DayPicker } from "react-day-picker";

import { dayPickerClassNames } from "@/components/day-picker-styles";

const calendarHasEventsClass =
  "[&>button]:relative [&>button]:pb-1 [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:h-1.5 [&>button]:after:w-5 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-[#9ec9e8] [&>button]:after:content-[''] [&[data-selected=true]>button]:after:bg-[#111827]";

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
