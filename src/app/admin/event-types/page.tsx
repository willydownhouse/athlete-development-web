import { AdminCreateModal } from "@/components/admin/admin-create-modal";
import { CreateEventTypeForm } from "@/components/admin/create-event-type-form";
import { EventTypeFilters } from "@/components/admin/event-type-filters";
import { EventTypeList } from "@/components/admin/event-type-list";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminEventTypes, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

type AdminEventTypesPageProps = {
  searchParams: Promise<{ sportId?: string; category?: string; active?: string }>;
};

export default async function AdminEventTypesPage({ searchParams }: AdminEventTypesPageProps) {
  const { token } = await requireAdmin();
  const params = await searchParams;

  const activeFilter =
    params.active === "true" ? true : params.active === "false" ? false : undefined;

  const [sports, eventTypes] = await Promise.all([
    listAdminSports(token),
    listAdminEventTypes(token, {
      sportId: params.sportId,
      category: params.category,
      active: activeFilter,
    }),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Event types"
          description="Configure event types and manage allowed metrics per type."
        />
        <AdminCreateModal title="Create event type" buttonLabel="Create event type">
          <CreateEventTypeForm sports={sports} />
        </AdminCreateModal>
      </div>

      <EventTypeFilters
        sports={sports}
        defaultSportId={params.sportId ?? ""}
        defaultActive={params.active ?? ""}
      />

      <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#171b22]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-white">Event types ({eventTypes.length})</h2>
        </div>

        {eventTypes.length === 0 ? (
          <p className="px-4 py-8 text-sm text-zinc-400 sm:px-6">
            No event types match the filters.
          </p>
        ) : (
          <EventTypeList eventTypes={eventTypes} />
        )}
      </section>
    </div>
  );
}
