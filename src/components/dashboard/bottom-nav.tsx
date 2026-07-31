"use client";

import { useTranslations } from "next-intl";

const NAV_ITEMS = [{ id: "chat", disabled: true }] as const;

export function DashboardBottomNav() {
  const t = useTranslations("dashboard.bottomNav");
  const tCommon = useTranslations("common");
  const tAria = useTranslations("aria");

  return (
    <nav
      aria-label={tAria("primaryNav")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0f1217]/90 backdrop-blur-md lg:left-64"
    >
      <div className="mx-auto flex w-full max-w-md justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            title={tCommon("comingSoon")}
            className="rounded-full bg-[#b7d7ec] px-8 py-2.5 text-sm font-semibold text-[#1a2430] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("chat")}
          </button>
        ))}
      </div>
    </nav>
  );
}
