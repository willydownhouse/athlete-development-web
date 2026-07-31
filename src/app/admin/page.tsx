import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/admin/page-header";
import {
  listAdminEventTypes,
  listAdminMetricDefinitions,
  listAdminOnboardingQuestions,
  listAdminSports,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

const overviewSections = [
  { key: "sports" as const, href: "/admin/sports" },
  { key: "eventTypes" as const, href: "/admin/event-types" },
  { key: "metricDefinitions" as const, href: "/admin/metric-definitions" },
  { key: "onboardingQuestions" as const, href: "/admin/onboarding-questions" },
] as const;

export default async function AdminOverviewPage() {
  const { token } = await requireAdmin();
  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");

  const [sports, eventTypes, metricDefinitions, onboardingQuestions] = await Promise.all([
    listAdminSports(token),
    listAdminEventTypes(token),
    listAdminMetricDefinitions(token),
    listAdminOnboardingQuestions(token),
  ]);

  const stats = [
    { total: sports.length, active: sports.filter((sport) => sport.active).length },
    { total: eventTypes.length, active: eventTypes.filter((eventType) => eventType.active).length },
    {
      total: metricDefinitions.length,
      active: metricDefinitions.filter((metric) => metric.active).length,
    },
    {
      total: onboardingQuestions.length,
      active: onboardingQuestions.filter((question) => question.active).length,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title={t("overview.title")} description={t("overview.description")} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewSections.map((section, index) => {
          const { total, active } = stats[index] ?? { total: 0, active: 0 };

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 transition hover:border-[#9ec9e8]/40 hover:bg-[#1c222c] sm:p-5"
            >
              <p className="text-sm font-medium text-zinc-400 group-hover:text-[#9ec9e8]">
                {t(`nav.${section.key}`)}
              </p>
              <p className="mt-2 text-3xl font-semibold text-white group-hover:text-[#b7d7ec]">
                {total}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {tCommon("activeCount", { count: active })}
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
