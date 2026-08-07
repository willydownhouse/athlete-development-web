"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type InfoTooltipProps = {
  label: string;
  children: ReactNode;
};

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path strokeLinecap="round" d="M10 9v5" />
      <circle cx="10" cy="6.25" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node) || containerRef.current?.contains(target)) {
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
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? tooltipId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-zinc-400 transition hover:bg-white/5 hover:text-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20"
      >
        <InfoIcon />
      </button>

      {open ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-white/10 bg-[#1c222c] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
