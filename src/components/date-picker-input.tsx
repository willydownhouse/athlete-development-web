"use client";

import { format, isValid, parseISO } from "date-fns";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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

const HIDDEN_PANEL_STYLE: CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 0,
  visibility: "hidden",
  zIndex: 60,
};

function overlayPanelStyle(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const panelWidth = Math.min(window.innerWidth - 24, 320);
  const panelHeight = 360;
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  const spaceAbove = rect.top - 12;
  const openUp = spaceBelow < panelHeight && spaceAbove > spaceBelow;

  return {
    position: "fixed",
    left: Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12)),
    width: panelWidth,
    top: openUp ? rect.top - panelHeight - 8 : rect.bottom + 8,
    visibility: "visible",
    zIndex: 60,
  };
}

type DatePickerInputProps = {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
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
  value,
  defaultValue,
  onChange,
  placeholder = "Select date",
  className,
  compact = false,
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
  const isControlled = value !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] = useState<Date | undefined>(() =>
    parseDateValue(defaultValue),
  );
  const selected = isControlled ? parseDateValue(value) : uncontrolledSelected;
  const [panelStyle, setPanelStyle] = useState<CSSProperties>(HIDDEN_PANEL_STYLE);

  function openPanel() {
    if (triggerRef.current) {
      setPanelStyle(overlayPanelStyle(triggerRef.current));
    }

    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      setPanelStyle(overlayPanelStyle(trigger));
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
  const displayValue = selected
    ? format(selected, compact ? "d MMM yy" : "MMM d, yyyy")
    : placeholder;

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
                if (isControlled) {
                  onChange?.(date ? format(date, "yyyy-MM-dd") : "");
                } else {
                  setUncontrolledSelected(date);
                }

                setOpen(false);
              }}
              defaultMonth={selected}
              captionLayout="dropdown"
              hideNavigation
              weekStartsOn={1}
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
    <div ref={containerRef} className="relative w-full">
      {name ? <input type="hidden" name={name} value={formattedValue} /> : null}
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }

          openPanel();
        }}
        className={`flex w-full items-center justify-between text-left ${compact ? "gap-1.5" : "gap-3"} ${className ?? ""}`}
      >
        <span
          className={`min-w-0 flex-1 truncate whitespace-nowrap ${selected ? "text-white" : "text-zinc-500"}`}
        >
          {displayValue}
        </span>
        <CalendarIcon compact={compact} />
      </button>
      {panel}
    </div>
  );
}

function CalendarIcon({ compact }: { compact?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`shrink-0 text-zinc-400 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
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
