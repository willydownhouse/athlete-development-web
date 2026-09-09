import { EventItemDisplay } from "@/components/dashboard/event-items/event-item-display";
import { eventItemSameTypeIndex, eventItemsSectionTitle } from "@/lib/event-item-display";
import type { EventItem } from "@/lib/types";

type EventItemsDisplayProps = {
  items: EventItem[];
  timeZone: string;
};

export function EventItemsDisplay({ items, timeZone }: EventItemsDisplayProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        {eventItemsSectionTitle(items)}
      </p>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl bg-[#171b22] px-3 py-3">
            <EventItemDisplay
              item={item}
              sameTypeIndex={eventItemSameTypeIndex(items, index)}
              timeZone={timeZone}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
