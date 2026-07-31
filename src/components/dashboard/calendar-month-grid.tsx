"use client";

import { DayPicker } from "react-day-picker";

import { dayPickerClassNames } from "@/components/day-picker-styles";

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
        has_events: dayPickerClassNames.has_events,
      }}
    />
  );
}
