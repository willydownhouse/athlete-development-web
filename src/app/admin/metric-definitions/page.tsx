import Link from "next/link";

import { CreateMetricDefinitionForm } from "@/components/admin/create-metric-definition-form";
import { MetricDefinitionFilters } from "@/components/admin/metric-definition-filters";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateMetricDefinitionForm } from "@/components/admin/update-metric-definition-form";
import { listAdminMetricDefinitions, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

type AdminMetricDefinitionsPageProps = {
  searchParams: Promise<{ sportId?: string; active?: string }>;
};

export default async function AdminMetricDefinitionsPage({
  searchParams,
}: AdminMetricDefinitionsPageProps) {
  const { token } = await requireAdmin();
  const params = await searchParams;

  const activeFilter =
    params.active === "true" ? true : params.active === "false" ? false : undefined;

  const [sports, metricDefinitions] = await Promise.all([
    listAdminSports(token),
    listAdminMetricDefinitions(token, {
      sportId: params.sportId,
      active: activeFilter,
    }),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Metric definitions"
        description="Define queryable metrics used on events and mapped to event types."
      />

      <MetricDefinitionFilters sports={sports} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium text-slate-900">Create metric definition</h2>
        <div className="mt-4">
          <CreateMetricDefinitionForm sports={sports} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-slate-900">
            Metric definitions ({metricDefinitions.length})
          </h2>
        </div>

        {metricDefinitions.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-600 sm:px-6">
            No metric definitions match the filters.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {metricDefinitions.map((metric) => (
              <li key={metric.id} className="px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">{metric.name}</h3>
                      <StatusBadge active={metric.active} />
                    </div>
                    <p className="mt-1 font-mono text-sm text-slate-500">{metric.key}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {metric.valueType}
                      {metric.canonicalUnit ? ` · ${metric.canonicalUnit}` : ""}
                      {" · "}
                      {metric.sport?.name ?? "General"}
                    </p>
                    {metric.description ? (
                      <p className="mt-2 text-sm text-slate-600">{metric.description}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/admin/event-types?active=true`}
                    className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Map to event types →
                  </Link>
                </div>
                <div className="mt-4">
                  <UpdateMetricDefinitionForm metric={metric} sports={sports} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
