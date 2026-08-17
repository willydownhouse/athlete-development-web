import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import type { EventItemType } from "@/lib/types";

type EventItemTypeListProps = {
  eventItemTypes: EventItemType[];
};

export function EventItemTypeList({ eventItemTypes }: EventItemTypeListProps) {
  return (
    <>
      <ul className="divide-y divide-white/10 md:hidden">
        {eventItemTypes.map((eventItemType) => (
          <li key={eventItemType.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{eventItemType.name}</h3>
                  <StatusBadge active={eventItemType.active} />
                </div>
                <p className="mt-1 break-all font-mono text-sm text-zinc-500">
                  {eventItemType.slug}
                </p>
              </div>
              <Link
                href={`/admin/event-item-types/${eventItemType.id}`}
                className="shrink-0 text-sm font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
              >
                Manage
              </Link>
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Sport</dt>
                <dd className="text-zinc-300">{eventItemType.sport?.name ?? "General"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#12161d] text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">Sport</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {eventItemTypes.map((eventItemType) => (
              <tr key={eventItemType.id} className="hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{eventItemType.name}</td>
                <td className="px-6 py-4 font-mono text-zinc-400">{eventItemType.slug}</td>
                <td className="px-6 py-4 text-zinc-400">
                  {eventItemType.sport?.name ?? "General"}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge active={eventItemType.active} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/event-item-types/${eventItemType.id}`}
                    className="font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
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
