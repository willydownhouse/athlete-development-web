import Link from "next/link";

import { AdminCreateModal } from "@/components/admin/admin-create-modal";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Metric definitions"
          description="Define queryable metrics used on events and mapped to event types."
        />
        <AdminCreateModal title="Create metric definition" buttonLabel="Create metric">
          <CreateMetricDefinitionForm sports={sports} />
        </AdminCreateModal>
      </div>

      <MetricDefinitionFilters sports={sports} />

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-white">
            Metric definitions ({metricDefinitions.length})
          </h2>
        </div>

        {metricDefinitions.length === 0 ? (
          <p className="px-4 py-8 text-sm text-zinc-400 sm:px-6">
            No metric definitions match the filters.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {metricDefinitions.map((metric) => (
              <li key={metric.id} className="px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{metric.name}</h3>
                      <StatusBadge active={metric.active} />
                    </div>
                    <p className="mt-1 font-mono text-sm text-zinc-500">{metric.key}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {metric.valueType}
                      {metric.canonicalUnit ? ` · ${metric.canonicalUnit}` : ""}
                      {" · "}
                      {metric.sport?.name ?? "General"}
                    </p>
                    {metric.description ? (
                      <p className="mt-2 text-sm text-zinc-400">{metric.description}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/admin/event-types?active=true`}
                    className="shrink-0 text-sm font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
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
