"use client";

import { format } from "date-fns";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { PickerMenu, isPickerOverlayTarget } from "@/components/picker-menu";

const menuTriggerClassName =
  "w-full rounded-lg border border-white/10 bg-[#252b36] py-1.5 pl-3 pr-8 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type TimeParts = {
  hours: number;
  minutes: number;
};

type TimePickerInputProps = {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

function parseTimeValue(value: string | undefined): TimeParts | undefined {
  if (!value) {
    return undefined;
  }

  const [hoursText, minutesText] = value.split(":");

  if (hoursText === undefined || minutesText === undefined) {
    return undefined;
  }

  const hours = Number.parseInt(hoursText, 10);
  const minutes = Number.parseInt(minutesText, 10);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return undefined;
  }

  return { hours, minutes };
}

function formatTimeValue({ hours, minutes }: TimeParts): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function displayTime({ hours, minutes }: TimeParts): string {
  return format(new Date(2000, 0, 1, hours, minutes), "h:mm a");
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: String(hour).padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => ({
  value: String(minute),
  label: String(minute).padStart(2, "0"),
}));

export function TimePickerInput({
  name,
  id,
  defaultValue,
  placeholder = "Select time",
  className,
}: TimePickerInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-panel`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TimeParts | undefined>(() =>
    parseTimeValue(defaultValue),
  );
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
      const panelHeight = 132;
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const openUp = spaceBelow < panelHeight && spaceAbove > spaceBelow;

      setPanelStyle({
        position: "fixed",
        left: rect.left,
        width: Math.min(rect.width, window.innerWidth - 24),
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

  const formattedValue = selected ? formatTimeValue(selected) : "";
  const displayValue = selected ? displayTime(selected) : placeholder;

  function updateHours(nextHours: number) {
    setSelected((current) => ({
      hours: nextHours,
      minutes: current?.minutes ?? 0,
    }));
  }

  function updateMinutes(nextMinutes: number) {
    setSelected((current) => ({
      hours: current?.hours ?? 12,
      minutes: nextMinutes,
    }));
  }

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Choose time"
            style={panelStyle}
            className="rounded-xl border border-white/10 bg-[#1c222c] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs font-medium text-zinc-500">Hour</span>
                <PickerMenu
                  aria-label="Hour"
                  className={menuTriggerClassName}
                  value={String(selected?.hours ?? 12)}
                  options={HOUR_OPTIONS}
                  onChange={(value) => updateHours(Number.parseInt(value, 10))}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs font-medium text-zinc-500">Minute</span>
                <PickerMenu
                  aria-label="Minute"
                  className={menuTriggerClassName}
                  value={String(selected?.minutes ?? 0)}
                  options={MINUTE_OPTIONS}
                  onChange={(value) => updateMinutes(Number.parseInt(value, 10))}
                />
              </label>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <input type="hidden" name={name} value={formattedValue} />
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 text-left ${className ?? ""}`}
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>{displayValue}</span>
        <ClockIcon />
      </button>
      {panel}
    </>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-zinc-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.5 2" />
      <path strokeLinecap="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
  );
}
