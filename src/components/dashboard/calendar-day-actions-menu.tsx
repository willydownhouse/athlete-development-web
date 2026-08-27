"use client";

import {
  EventActionMenu,
  type EventActionMenuItem,
} from "@/components/dashboard/event-action-menu";

type CalendarDayActionsMenuProps = {
  onAddClick?: () => void;
  onCopyClick?: () => void;
  copyDisabled?: boolean;
};

export function CalendarDayActionsMenu({
  onAddClick,
  onCopyClick,
  copyDisabled = false,
}: CalendarDayActionsMenuProps) {
  const items: EventActionMenuItem[] = [];

  if (onAddClick) {
    items.push({ label: "Add", onClick: onAddClick });
  }

  if (onCopyClick) {
    items.push({
      label: "Copy day",
      onClick: onCopyClick,
      disabled: copyDisabled,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return <EventActionMenu items={items} aria-label="Day actions" />;
}
