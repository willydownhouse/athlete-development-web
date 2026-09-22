import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import {
  listAdminDemoAllowedEmails,
  listAdminEventItemTypes,
  listAdminEventTypes,
  listAdminMetricDefinitions,
  listAdminSports,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminOverviewPage() {
  const { token } = await requireAdmin();

  const [sports, eventTypes, eventItemTypes, metricDefinitions, demoAllowedEmails] =
    await Promise.all([
      listAdminSports(token),
      listAdminEventTypes(token),
      listAdminEventItemTypes(token),
      listAdminMetricDefinitions(token),
      listAdminDemoAllowedEmails(token),
    ]);

  const stats = [
    {
      title: "Sports",
      href: "/admin/sports",
      total: sports.length,
      detail: `${sports.filter((sport) => sport.active).length} active`,
    },
    {
      title: "Event types",
      href: "/admin/event-types",
      total: eventTypes.length,
      detail: `${eventTypes.filter((eventType) => eventType.active).length} active`,
    },
    {
      title: "Event item types",
      href: "/admin/event-item-types",
      total: eventItemTypes.length,
      detail: `${eventItemTypes.filter((itemType) => itemType.active).length} active`,
    },
    {
      title: "Metric definitions",
      href: "/admin/metric-definitions",
      total: metricDefinitions.length,
      detail: `${metricDefinitions.filter((metric) => metric.active).length} active`,
    },
    {
      title: "Demo users",
      href: "/admin/demo-users",
      total: demoAllowedEmails.items.length,
      detail: demoAllowedEmails.enabled ? "Gate on" : "Gate off",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Admin overview"
        description="Manage sports, event types, event item types, metric definitions, and demo users."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 transition hover:border-[#9ec9e8]/40 hover:bg-[#1c222c] sm:p-5"
          >
            <p className="text-sm font-medium text-zinc-400 group-hover:text-[#9ec9e8]">
              {section.title}
            </p>
            <p className="mt-2 text-3xl font-semibold text-white group-hover:text-[#b7d7ec]">
              {section.total}
            </p>
            <p className="mt-1 text-sm text-zinc-400">{section.detail}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
