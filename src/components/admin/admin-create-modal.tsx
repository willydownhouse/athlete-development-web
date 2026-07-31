"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

const AdminCreateModalCloseContext = createContext<(() => void) | null>(null);

export function useAdminCreateModalClose(): (() => void) | undefined {
  return useContext(AdminCreateModalCloseContext) ?? undefined;
}

type AdminCreateModalProps = {
  title: string;
  buttonLabel: string;
  children: ReactNode;
};

export function AdminCreateModal({ title, buttonLabel, children }: AdminCreateModalProps) {
  const tAria = useTranslations("aria");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] sm:w-auto sm:py-2.5"
      >
        {buttonLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={tAria("closeDialog")}
            className="absolute inset-0 bg-black/60"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(85vh,85dvh)] w-full max-w-xl flex-col rounded-[1.35rem] border border-white/10 bg-[#171b22] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
              <h2 id={titleId} className="text-lg font-medium text-white">
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                {tCommon("close")}
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
              <AdminCreateModalCloseContext.Provider value={close}>
                {children}
              </AdminCreateModalCloseContext.Provider>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
