"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export type FormSelectOption = {
  value: string;
  label: string;
};

export type FormSelectGroup = {
  label: string;
  options: FormSelectOption[];
};

type FormSelectProps = {
  name: string;
  options?: FormSelectOption[];
  groups?: FormSelectGroup[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onValueChange?: (value: string) => void;
};

function flattenOptions(
  options: FormSelectOption[] | undefined,
  groups: FormSelectGroup[] | undefined,
): FormSelectOption[] {
  if (options) {
    return options;
  }

  return groups?.flatMap((group) => group.options) ?? [];
}

export function FormSelect({
  name,
  options,
  groups,
  defaultValue = "",
  placeholder = "Select",
  className = "",
  onValueChange,
}: FormSelectProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const allOptions = flattenOptions(options, groups);
  const selectedOption = allOptions.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

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
      const menuMaxHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      const maxHeight = Math.min(menuMaxHeight, openUp ? spaceAbove : spaceBelow);

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        top: openUp ? rect.top - maxHeight - 4 : rect.bottom + 4,
        maxHeight,
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

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function renderOption(option: FormSelectOption) {
    const selected = option.value === value;

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => {
          setValue(option.value);
          onValueChange?.(option.value);
          setOpen(false);
        }}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
          selected ? "bg-white/5 text-white" : "text-zinc-300"
        }`}
      >
        <span>{option.label}</span>
        {selected ? <span className="text-xs text-[#9ec9e8]">Selected</span> : null}
      </button>
    );
  }

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            style={menuStyle}
            className="overflow-y-auto rounded-xl border border-white/10 bg-[#1c222c] py-1 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            {groups
              ? groups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      {group.label}
                    </p>
                    {group.options.map((option) => renderOption(option))}
                  </div>
                ))
              : options?.map((option) => renderOption(option))}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 text-left ${className}`}
      >
        <span className={selectedOption ? "text-white" : "text-zinc-500"}>{displayLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {menu}
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
    </svg>
  );
}
