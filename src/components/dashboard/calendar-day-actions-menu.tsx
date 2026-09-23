"use client";

import {
  EventActionMenu,
  type EventActionMenuItem,
} from "@/components/dashboard/event-action-menu";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";

type CalendarDayActionsMenuProps = {
  onCopyClick?: () => void;
  copyDisabled?: boolean;
};

export function CalendarDayActionsMenu({
  onCopyClick,
  copyDisabled = false,
}: CalendarDayActionsMenuProps) {
  const messages = getMessages(useAppLocale());
  const items: EventActionMenuItem[] = [];

  if (onCopyClick) {
    items.push({
      label: messages.calendar.copyDay,
      onClick: onCopyClick,
      disabled: copyDisabled,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return <EventActionMenu items={items} aria-label={messages.calendar.dayActions} />;
}
