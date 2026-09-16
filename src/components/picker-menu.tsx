"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactElement,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

import { CheckIcon } from "@/components/check-icon";

const HIDDEN_MENU_STYLE: CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 0,
  visibility: "hidden",
  zIndex: 70,
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
    zIndex: 70,
  };
}

export function isPickerOverlayTarget(target: Node) {
  return target instanceof Element && target.closest("[data-picker-overlay]") !== null;
}

type PickerMenuOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type PickerMenuProps = {
  value: string;
  options: PickerMenuOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
    </svg>
  );
}

export function PickerMenu({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "",
  className = "",
  "aria-label": ariaLabel,
}: PickerMenuProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>(HIDDEN_MENU_STYLE);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? (value || placeholder);
  const isOpen = open && !disabled;

  useLayoutEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
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
  }, [isOpen]);

  const menu =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            data-picker-overlay=""
            style={menuStyle}
            className="scheme-dark fixed overflow-y-auto rounded-xl border border-white/10 bg-[#1c222c] py-1 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected ? "bg-white/5 text-white" : "text-zinc-300"
                  }`}
                >
                  <span>{option.label}</span>
                  {selected ? <CheckIcon /> : null}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          if (open) {
            setOpen(false);
            return;
          }

          if (triggerRef.current) {
            setMenuStyle(overlayMenuStyle(triggerRef.current));
          }

          setOpen(true);
        }}
        className={`relative flex w-full items-center text-left disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="truncate pr-6">{displayLabel}</span>
        <ChevronIcon open={isOpen} />
      </button>
      {menu}
    </>
  );
}

function optionsFromSelectChildren(children: SelectHTMLAttributes<HTMLSelectElement>["children"]) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    const option = child as ReactElement<{
      value?: string | number;
      disabled?: boolean;
      children?: React.ReactNode;
    }>;

    return [
      {
        value: String(option.props.value ?? ""),
        label: String(option.props.children ?? option.props.value ?? ""),
        disabled: option.props.disabled,
      },
    ];
  });
}

export function PortalSelect({
  className,
  value,
  onChange,
  disabled,
  children,
  "aria-label": ariaLabel,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = optionsFromSelectChildren(children);

  return (
    <PickerMenu
      value={String(value ?? "")}
      options={options}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      onChange={(nextValue) => {
        onChange?.({
          target: { value: nextValue },
        } as ChangeEvent<HTMLSelectElement>);
      }}
    />
  );
}
