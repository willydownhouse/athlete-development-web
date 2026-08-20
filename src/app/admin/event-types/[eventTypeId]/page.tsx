import Link from "next/link";
import { notFound } from "next/navigation";

import { EventTypeItemTypesSection } from "@/components/admin/event-type-item-types-section";
import { EventTypeMetricsSection } from "@/components/admin/event-type-metrics-section";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateEventTypeForm } from "@/components/admin/update-event-type-form";
import {
  getAdminEventType,
  listAdminEventItemTypes,
  listAdminEventTypeItemTypes,
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

function isItemTypeCompatibleWithEventType(
  eventTypeSportId: string | null,
  itemTypeSportId: string | null,
): boolean {
  if (itemTypeSportId === null) {
    return true;
  }

  return eventTypeSportId === itemTypeSportId;
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

  const [sports, metricMappings, itemTypeMappings, allMetrics, allItemTypes] = await Promise.all([
    listAdminSports(token),
    listAdminEventTypeMetricDefinitions(token, eventTypeId),
    listAdminEventTypeItemTypes(token, eventTypeId),
    listAdminMetricDefinitions(token),
    listAdminEventItemTypes(token),
  ]);

  const mappedMetricIds = new Set(metricMappings.map((mapping) => mapping.metricDefinitionId));
  const mappedItemTypeIds = new Set(itemTypeMappings.map((mapping) => mapping.eventItemTypeId));

  const availableMetrics = allMetrics.filter(
    (metric) =>
      metric.active &&
      !mappedMetricIds.has(metric.id) &&
      isMetricCompatibleWithEventType(eventType.sportId, metric.sportId),
  );

  const availableItemTypes = allItemTypes.filter(
    (itemType) =>
      itemType.active &&
      !mappedItemTypeIds.has(itemType.id) &&
      isItemTypeCompatibleWithEventType(eventType.sportId, itemType.sportId),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/event-types"
          className="inline-flex text-sm font-medium text-zinc-400 hover:text-white"
        >
          ← Back to event types
        </Link>
        <PageHeader
          title={eventType.name}
          description={`Manage event type settings, allowed metrics, and root item types for ${eventType.slug}.`}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <StatusBadge active={eventType.active} />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300 capitalize">
            {formatCategoryLabel(eventType.category)}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {eventType.sport?.name ?? "General"}
          </span>
        </div>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <h2 className="text-lg font-medium text-white">Event type settings</h2>
        <div className="mt-4">
          <UpdateEventTypeForm eventType={eventType} sports={sports} />
        </div>
      </section>

      <EventTypeMetricsSection
        eventTypeId={eventTypeId}
        mappings={metricMappings}
        availableMetrics={availableMetrics}
      />

      <EventTypeItemTypesSection
        eventTypeId={eventTypeId}
        mappings={itemTypeMappings}
        availableItemTypes={availableItemTypes}
      />
    </div>
  );
}
