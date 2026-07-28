"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { SignOutButton } from "@/components/sign-out-button";

import { AdminNav } from "./admin-nav";

type AdminShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function AdminShell({ userEmail, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobile();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="flex min-h-screen bg-[#0b0d10] text-white">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,16rem)] flex-col border-r border-white/5 bg-[#12161d] transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-white/5 px-4 py-5 sm:px-5 sm:py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Admin</p>
            <p className="mt-1 text-lg font-semibold text-white">Athlete Development Center</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav onNavigate={closeMobile} />
        </div>

        <div className="space-y-3 border-t border-white/5 px-4 py-4 sm:px-5">
          <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          <Link
            href="/dashboard"
            className="block text-sm text-zinc-300 transition hover:text-white"
            onClick={closeMobile}
          >
            Back to app
          </Link>
          <SignOutButton className="inline-flex w-full justify-center rounded-xl border border-white/10 bg-[#1c222c] px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-[#252b36]" />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-[#0b0d10]/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#171b22] p-2 text-zinc-200 transition hover:bg-[#1f2530]"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Admin</p>
            <p className="truncate text-xs text-zinc-500">Athlete Development Center</p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
