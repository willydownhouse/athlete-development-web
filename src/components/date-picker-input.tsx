"use client";

import { format, isValid, parseISO } from "date-fns";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { DayPicker, type Matcher } from "react-day-picker";

import { dayPickerClassNames } from "@/components/day-picker-styles";
import { PortalSelect, isPickerOverlayTarget } from "@/components/picker-menu";

const datePickerClassNames = {
  ...dayPickerClassNames,
  root: `${dayPickerClassNames.root} w-full`,
  month_caption: "relative mb-2 w-full",
  caption_label: "hidden",
  nav: "hidden",
  dropdowns: "flex w-full items-center gap-2",
  dropdown_root: "relative min-w-0 flex-1",
  dropdown:
    "w-full rounded-lg border border-white/10 bg-[#252b36] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20",
  weekday: "flex-1 text-center text-xs font-medium text-zinc-500",
  week: "mt-1 flex w-full",
  day: "relative flex-1 p-0 text-center text-sm",
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
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() => parseDateValue(defaultValue));
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const panelWidth = Math.min(window.innerWidth - 24, 320);
      const panelHeight = 360;
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const openUp = spaceBelow < panelHeight && spaceAbove > spaceBelow;

      setPanelStyle({
        position: "fixed",
        left: Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12)),
        width: panelWidth,
        top: openUp ? rect.top - panelHeight - 8 : rect.bottom + 8,
        zIndex: 60,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        isPickerOverlayTarget(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open]);

  const formattedValue = selected ? format(selected, "yyyy-MM-dd") : "";
  const displayValue = selected ? format(selected, "MMM d, yyyy") : placeholder;

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choose date"
            style={panelStyle}
            className="rounded-xl border border-white/10 bg-[#1c222c] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
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
              hideNavigation
              reverseYears
              startMonth={new Date(fromYear, 0)}
              endMonth={new Date(toYear, 11)}
              disabled={disabledDates}
              classNames={datePickerClassNames}
              components={{ Select: PortalSelect }}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={formattedValue} />
      <button
        ref={triggerRef}
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
      {panel}
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
