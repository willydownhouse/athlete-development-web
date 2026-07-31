import { getTranslations } from "next-intl/server";

type StatusBadgeProps = {
  active: boolean;
};

export async function StatusBadge({ active }: StatusBadgeProps) {
  const t = await getTranslations("common");

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-zinc-400"
      }`}
    >
      {active ? t("active") : t("inactive")}
    </span>
  );
}
