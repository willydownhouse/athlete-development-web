import Link from "next/link";
import { notFound } from "next/navigation";

import { EventItemTypeChildTypesSection } from "@/components/admin/event-item-type-child-types-section";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateEventItemTypeForm } from "@/components/admin/update-event-item-type-form";
import {
  getAdminEventItemType,
  listAdminEventItemTypeChildTypes,
  listAdminEventItemTypes,
  listAdminSports,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

type AdminEventItemTypeDetailPageProps = {
  params: Promise<{ eventItemTypeId: string }>;
};

function isChildItemTypeCompatibleWithParent(
  parentSportId: string | null,
  childSportId: string | null,
): boolean {
  if (childSportId === null) {
    return true;
  }

  return parentSportId === childSportId;
}

export default async function AdminEventItemTypeDetailPage({
  params,
}: AdminEventItemTypeDetailPageProps) {
  const { eventItemTypeId } = await params;
  const { token } = await requireAdmin();

  let eventItemType;

  try {
    eventItemType = await getAdminEventItemType(token, eventItemTypeId);
  } catch {
    notFound();
  }

  const [sports, childMappings, allItemTypes] = await Promise.all([
    listAdminSports(token),
    listAdminEventItemTypeChildTypes(token, eventItemTypeId),
    listAdminEventItemTypes(token),
  ]);

  const mappedChildIds = new Set(childMappings.map((mapping) => mapping.childEventItemTypeId));

  const availableChildItemTypes = allItemTypes.filter(
    (itemType) =>
      itemType.active &&
      itemType.id !== eventItemTypeId &&
      !mappedChildIds.has(itemType.id) &&
      isChildItemTypeCompatibleWithParent(eventItemType.sportId, itemType.sportId),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/event-item-types"
          className="inline-flex text-sm font-medium text-zinc-400 hover:text-white"
        >
          ← Back to event item types
        </Link>
        <PageHeader
          title={eventItemType.name}
          description={`Manage item type settings and allowed child types for ${eventItemType.slug}.`}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <StatusBadge active={eventItemType.active} />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {eventItemType.sport?.name ?? "General"}
          </span>
        </div>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <h2 className="text-lg font-medium text-white">Item type settings</h2>
        <div className="mt-4">
          <UpdateEventItemTypeForm eventItemType={eventItemType} sports={sports} />
        </div>
      </section>

      <EventItemTypeChildTypesSection
        eventItemTypeId={eventItemTypeId}
        mappings={childMappings}
        availableChildItemTypes={availableChildItemTypes}
      />
    </div>
  );
}
