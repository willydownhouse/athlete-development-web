import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { formatCategoryLabel, type EventType } from "@/lib/types";

type EventTypeListProps = {
  eventTypes: EventType[];
};

export function EventTypeList({ eventTypes }: EventTypeListProps) {
  return (
    <>
      <ul className="divide-y divide-slate-200 md:hidden">
        {eventTypes.map((eventType) => (
          <li key={eventType.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-900">{eventType.name}</h3>
                  <StatusBadge active={eventType.active} />
                </div>
                <p className="mt-1 break-all font-mono text-sm text-slate-500">{eventType.slug}</p>
              </div>
              <Link
                href={`/admin/event-types/${eventType.id}`}
                className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Manage
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-slate-500">Category</dt>
                <dd className="capitalize text-slate-700">
                  {formatCategoryLabel(eventType.category)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Sport</dt>
                <dd className="text-slate-700">{eventType.sport?.name ?? "General"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Sport</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {eventTypes.map((eventType) => (
              <tr key={eventType.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{eventType.name}</td>
                <td className="px-6 py-4 font-mono text-slate-600">{eventType.slug}</td>
                <td className="px-6 py-4 capitalize text-slate-600">
                  {formatCategoryLabel(eventType.category)}
                </td>
                <td className="px-6 py-4 text-slate-600">{eventType.sport?.name ?? "General"}</td>
                <td className="px-6 py-4">
                  <StatusBadge active={eventType.active} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/event-types/${eventType.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
