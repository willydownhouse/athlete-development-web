import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { listAdminEventTypes, listAdminMetricDefinitions, listAdminSports } from "@/lib/admin-api";
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
] as const;

export default async function AdminOverviewPage() {
  const { token } = await requireAdmin();

  const [sports, eventTypes, metricDefinitions] = await Promise.all([
    listAdminSports(token),
    listAdminEventTypes(token),
    listAdminMetricDefinitions(token),
  ]);

  const stats = [
    { total: sports.length, active: sports.filter((sport) => sport.active).length },
    { total: eventTypes.length, active: eventTypes.filter((eventType) => eventType.active).length },
    {
      total: metricDefinitions.length,
      active: metricDefinitions.filter((metric) => metric.active).length,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Admin overview"
        description="Manage sports, event types, and metric definitions for the platform."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {overviewSections.map((section, index) => {
          const { total, active } = stats[index] ?? { total: 0, active: 0 };

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:p-5"
            >
              <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600">
                {section.title}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 group-hover:text-blue-700">
                {total}
              </p>
              <p className="mt-1 text-sm text-slate-600">{active} active</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
