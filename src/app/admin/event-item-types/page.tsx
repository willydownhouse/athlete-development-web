import { AdminCreateModal } from "@/components/admin/admin-create-modal";
import { CreateEventItemTypeForm } from "@/components/admin/create-event-item-type-form";
import { EventItemTypeFilters } from "@/components/admin/event-item-type-filters";
import { EventItemTypeList } from "@/components/admin/event-item-type-list";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminEventItemTypes, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

type AdminEventItemTypesPageProps = {
  searchParams: Promise<{ sportId?: string; active?: string }>;
};

export default async function AdminEventItemTypesPage({
  searchParams,
}: AdminEventItemTypesPageProps) {
  const { token } = await requireAdmin();
  const params = await searchParams;

  const activeFilter =
    params.active === "true" ? true : params.active === "false" ? false : undefined;

  const [sports, eventItemTypes] = await Promise.all([
    listAdminSports(token),
    listAdminEventItemTypes(token, {
      sportId: params.sportId,
      active: activeFilter,
    }),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Event item types"
          description="Define item types used in nested event details, child mappings, and event type roots."
        />
        <AdminCreateModal title="Create event item type" buttonLabel="Create item type">
          <CreateEventItemTypeForm sports={sports} />
        </AdminCreateModal>
      </div>

      <EventItemTypeFilters
        sports={sports}
        defaultSportId={params.sportId ?? ""}
        defaultActive={params.active ?? ""}
      />

      <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#171b22]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-white">
            Event item types ({eventItemTypes.length})
          </h2>
        </div>

        {eventItemTypes.length === 0 ? (
          <p className="px-4 py-8 text-sm text-zinc-400 sm:px-6">
            No event item types match the filters.
          </p>
        ) : (
          <EventItemTypeList eventItemTypes={eventItemTypes} />
        )}
      </section>
    </div>
  );
}
