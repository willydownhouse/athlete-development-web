import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import {
  listAdminEventTypes,
  listAdminMetricDefinitions,
  listAdminOnboardingQuestions,
  listAdminSports,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

const overviewSections = [
  {
    title: "Sports",
    href: "/admin/sports",
  },
  {
    title: "Event types",
    href: "/admin/event-types",
  },
  {
    title: "Metric definitions",
    href: "/admin/metric-definitions",
  },
  {
    title: "Onboarding questions",
    href: "/admin/onboarding-questions",
  },
] as const;

export default async function AdminOverviewPage() {
  const { token } = await requireAdmin();

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
      <PageHeader
        title="Admin overview"
        description="Manage sports, event types, metric definitions, and onboarding questions."
      />

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
                {section.title}
              </p>
              <p className="mt-2 text-3xl font-semibold text-white group-hover:text-[#b7d7ec]">
                {total}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{active} active</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
