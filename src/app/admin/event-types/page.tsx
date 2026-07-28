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

  console.log("eventTypes", eventTypes);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Event types"
        description="Configure event types and manage allowed metrics per type."
      />

      <EventTypeFilters sports={sports} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium text-slate-900">Create event type</h2>
        <div className="mt-4">
          <CreateEventTypeForm sports={sports} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-slate-900">Event types ({eventTypes.length})</h2>
        </div>

        {eventTypes.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-600 sm:px-6">
            No event types match the filters.
          </p>
        ) : (
          <EventTypeList eventTypes={eventTypes} />
        )}
      </section>
    </div>
  );
}
