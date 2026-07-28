import Link from "next/link";
import { notFound } from "next/navigation";

import { EventTypeMetricsSection } from "@/components/admin/event-type-metrics-section";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateEventTypeForm } from "@/components/admin/update-event-type-form";
import {
  getAdminEventType,
  listAdminEventTypeMetricDefinitions,
  listAdminMetricDefinitions,
  listAdminSports,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCategoryLabel } from "@/lib/types";

type AdminEventTypeDetailPageProps = {
  params: Promise<{ eventTypeId: string }>;
};

function isMetricCompatibleWithEventType(
  eventTypeSportId: string | null,
  metricSportId: string | null,
): boolean {
  if (metricSportId === null) {
    return true;
  }

  return eventTypeSportId === metricSportId;
}

export default async function AdminEventTypeDetailPage({ params }: AdminEventTypeDetailPageProps) {
  const { eventTypeId } = await params;
  const { token } = await requireAdmin();

  let eventType;

  try {
    eventType = await getAdminEventType(token, eventTypeId);
  } catch {
    notFound();
  }

  const [sports, mappings, allMetrics] = await Promise.all([
    listAdminSports(token),
    listAdminEventTypeMetricDefinitions(token, eventTypeId),
    listAdminMetricDefinitions(token),
  ]);

  const mappedMetricIds = new Set(mappings.map((mapping) => mapping.metricDefinitionId));

  const availableMetrics = allMetrics.filter(
    (metric) =>
      metric.active &&
      !mappedMetricIds.has(metric.id) &&
      isMetricCompatibleWithEventType(eventType.sportId, metric.sportId),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/event-types"
          className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to event types
        </Link>
        <PageHeader
          title={eventType.name}
          description={`Manage event type settings and allowed metrics for ${eventType.slug}.`}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <StatusBadge active={eventType.active} />
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 capitalize">
            {formatCategoryLabel(eventType.category)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5">
            {eventType.sport?.name ?? "General"}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium text-slate-900">Event type settings</h2>
        <div className="mt-4">
          <UpdateEventTypeForm eventType={eventType} sports={sports} />
        </div>
      </section>

      <EventTypeMetricsSection
        eventTypeId={eventTypeId}
        mappings={mappings}
        availableMetrics={availableMetrics}
      />
    </div>
  );
}
