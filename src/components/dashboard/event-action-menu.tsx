"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

export type EventActionMenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
};

type EventActionMenuProps = {
  items: EventActionMenuItem[];
  onTriggerClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
};

function MoreIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  );
}

export function EventActionMenu({
  items,
  onTriggerClick,
  "aria-label": ariaLabel = "Event actions",
}: EventActionMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number }>({
    top: 0,
    left: 0,
    minWidth: 0,
  });

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
      const menuWidth = 160;
      const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8);
      const top = rect.bottom + 6;

      setMenuStyle({
        top: Math.max(8, top),
        left: Math.max(8, left),
        minWidth: menuWidth,
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

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    onTriggerClick?.(event);
    setOpen((current) => !current);
  };

  const handleItemClick = (item: EventActionMenuItem) => {
    if (item.disabled) {
      return;
    }

    setOpen(false);
    item.onClick();
  };

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            data-picker-overlay=""
            className="fixed z-[200] overflow-hidden rounded-xl border border-white/10 bg-[#1c2129] py-1 shadow-xl shadow-black/40"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              minWidth: menuStyle.minWidth,
            }}
          >
            {items.map((item) => (
              <div key={item.label}>
                {item.separatorBefore ? (
                  <div className="my-1 border-t border-white/10" role="separator" />
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    item.destructive
                      ? "text-red-300 hover:bg-[#252b36] hover:text-red-200"
                      : "text-zinc-200 hover:bg-[#252b36] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleTriggerClick}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-zinc-300 transition hover:bg-[#2f3642] hover:text-white"
      >
        <MoreIcon />
      </button>
      {menu}
    </>
  );
}
