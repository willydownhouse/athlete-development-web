"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Keep dialog content mounted while hidden so uncontrolled fields keep their values. */
  keepMounted?: boolean;
  /** Offset centering on lg+ to account for the w-64 app sidebar. */
  align?: "viewport" | "content";
};

export function Modal({
  open,
  onClose,
  title,
  children,
  keepMounted = false,
  align = "viewport",
}: ModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open && !keepMounted) {
    return null;
  }

  const overlayClassName =
    align === "content"
      ? "fixed inset-0 z-50 flex items-center justify-center p-4 lg:left-64"
      : "fixed inset-0 z-50 flex items-center justify-center p-4";

  return (
    <div className={open ? overlayClassName : "hidden"} aria-hidden={open ? undefined : true}>
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(85vh,85dvh)] w-full max-w-xl flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#171b22] shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 id={titleId} className="text-lg font-medium text-white">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
