import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { StatusBadge } from "@/components/admin/status-badge";
import { createCategoryLabel } from "@/lib/i18n-labels";
import type { EventType } from "@/lib/types";

type EventTypeListProps = {
  eventTypes: EventType[];
};

export async function EventTypeList({ eventTypes }: EventTypeListProps) {
  const tCommon = await getTranslations("common");
  const tAdmin = await getTranslations("admin");
  const categoryLabel = createCategoryLabel(tAdmin);

  return (
    <>
      <ul className="divide-y divide-white/10 md:hidden">
        {eventTypes.map((eventType) => (
          <li key={eventType.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{eventType.name}</h3>
                  <StatusBadge active={eventType.active} />
                </div>
                <p className="mt-1 break-all font-mono text-sm text-zinc-500">{eventType.slug}</p>
              </div>
              <Link
                href={`/admin/event-types/${eventType.id}`}
                className="shrink-0 text-sm font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
              >
                {tCommon("manage")}
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">{tCommon("category")}</dt>
                <dd className="capitalize text-zinc-300">{categoryLabel(eventType.category)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{tCommon("sport")}</dt>
                <dd className="text-zinc-300">{eventType.sport?.name ?? tCommon("general")}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#12161d] text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-medium">{tCommon("name")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("slug")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("category")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("sport")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("status")}</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {eventTypes.map((eventType) => (
              <tr key={eventType.id} className="hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{eventType.name}</td>
                <td className="px-6 py-4 font-mono text-zinc-400">{eventType.slug}</td>
                <td className="px-6 py-4 capitalize text-zinc-400">
                  {categoryLabel(eventType.category)}
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {eventType.sport?.name ?? tCommon("general")}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge active={eventType.active} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/event-types/${eventType.id}`}
                    className="font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
                  >
                    {tCommon("manage")}
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
