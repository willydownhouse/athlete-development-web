"use client";

import { QuickLogCard } from "@/components/dashboard/quick-log-card";
import type { EventType } from "@/lib/types";

import { useDashboardInteractions } from "./dashboard-interactions";

type QuickLogSectionProps = {
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
};

export function QuickLogSection({
  eventTypes,
  focusSportName,
  eventTypesError,
}: QuickLogSectionProps) {
  const { openCreateModal } = useDashboardInteractions();

  return (
    <QuickLogCard
      eventTypes={eventTypes}
      focusSportName={focusSportName}
      loadError={eventTypesError}
      onEventTypeClick={(defaultEventTypeId) => openCreateModal({ defaultEventTypeId })}
    />
  );
}
