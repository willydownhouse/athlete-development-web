import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
import { createCategoryLabel } from "@/lib/i18n-labels";

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
  const tAdmin = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const categoryLabel = createCategoryLabel(tAdmin);

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
          className="inline-flex text-sm font-medium text-zinc-400 hover:text-white"
        >
          {tAdmin("eventTypes.backToList")}
        </Link>
        <PageHeader
          title={eventType.name}
          description={tAdmin("eventTypes.detailDescription", { slug: eventType.slug })}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <StatusBadge active={eventType.active} />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300 capitalize">
            {categoryLabel(eventType.category)}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {eventType.sport?.name ?? tCommon("general")}
          </span>
        </div>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <h2 className="text-lg font-medium text-white">{tAdmin("eventTypes.settingsTitle")}</h2>
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
