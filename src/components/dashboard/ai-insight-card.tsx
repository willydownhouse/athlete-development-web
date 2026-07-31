"use client";

import { useTranslations } from "next-intl";

export function AiInsightCard() {
  const t = useTranslations("dashboard.aiInsight");
  const tCommon = useTranslations("common");

  return (
    <section className="rounded-[1.35rem] bg-[#1c2430] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{t("title")}</h2>
        <span className="text-sm text-zinc-400">{tCommon("now")}</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-zinc-200">{t("mockText")}</p>
    </section>
  );
}
