"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

import { CheckIcon } from "@/components/check-icon";
import type { FormSelectGroup, FormSelectOption } from "@/components/form/form-select";
import { useListboxKeyboard } from "@/components/listbox-keyboard";

const HIDDEN_MENU_STYLE: CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 0,
  visibility: "hidden",
  zIndex: 60,
};

function overlayMenuStyle(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const menuMaxHeight = 240;
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  const spaceAbove = rect.top - 12;
  const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
  const maxHeight = Math.min(menuMaxHeight, openUp ? spaceAbove : spaceBelow);

  return {
    position: "fixed",
    left: rect.left,
    width: rect.width,
    top: openUp ? rect.top - maxHeight - 4 : rect.bottom + 4,
    maxHeight,
    visibility: "visible",
    zIndex: 60,
  };
}

type FormMultiSelectProps = {
  values: string[];
  options?: FormSelectOption[];
  groups?: FormSelectGroup[];
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
  onChange: (values: string[]) => void;
  "aria-label"?: string;
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

function displayLabel(
  selected: FormSelectOption[],
  placeholder: string,
  emptyLabel: string,
): string {
  if (selected.length === 0) {
    return emptyLabel || placeholder;
  }

  if (selected.length === 1) {
    return selected[0]?.label ?? placeholder;
  }

  if (selected.length === 2) {
    return selected.map((option) => option.label).join(", ");
  }

  return `${selected.length} selected`;
}

export function FormMultiSelect({
  values,
  options,
  groups,
  placeholder = "Select",
  emptyLabel = "All",
  className = "",
  onChange,
  "aria-label": ariaLabel,
}: FormMultiSelectProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>(HIDDEN_MENU_STYLE);
  const closeListbox = useCallback(() => setOpen(false), []);

  const allOptions = flattenOptions(options, groups);
  const selectedOptions = allOptions.filter((option) => values.includes(option.value));
  const label = displayLabel(selectedOptions, placeholder, emptyLabel);

  function toggleValue(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  }

  function openListbox() {
    if (triggerRef.current) {
      setMenuStyle(overlayMenuStyle(triggerRef.current));
    }

    setOpen(true);
  }

  useListboxKeyboard({
    open,
    listRef,
    triggerRef,
    onClose: closeListbox,
  });

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      setMenuStyle(overlayMenuStyle(trigger));
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

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  function renderOption(option: FormSelectOption) {
    const selected = values.includes(option.value);

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={selected}
        tabIndex={-1}
        onClick={() => {
          toggleValue(option.value);
        }}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
          selected ? "bg-white/5 text-white" : "text-zinc-300"
        }`}
      >
        <span>{option.label}</span>
        {selected ? <CheckIcon /> : null}
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
            aria-multiselectable="true"
            style={menuStyle}
            className="scheme-dark fixed overflow-y-auto rounded-xl border border-white/10 bg-[#1c222c] py-1 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            <button
              type="button"
              role="option"
              aria-selected={values.length === 0}
              tabIndex={-1}
              onClick={() => {
                onChange([]);
              }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
                values.length === 0 ? "bg-white/5 text-white" : "text-zinc-300"
              }`}
            >
              <span>{emptyLabel}</span>
              {values.length === 0 ? <CheckIcon /> : null}
            </button>
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
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          if (open) {
            closeListbox();
            return;
          }

          openListbox();
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return;
          }

          event.preventDefault();

          if (!open) {
            openListbox();
          }
        }}
        className={`flex w-full items-center justify-between gap-3 text-left ${className}`}
      >
        <span className={`truncate ${selectedOptions.length > 0 ? "text-white" : "text-zinc-500"}`}>
          {label}
        </span>
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
