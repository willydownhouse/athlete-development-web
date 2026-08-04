"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { EventFormModal, type EventModalState } from "@/components/dashboard/event-form-modal";
import { startOfLocalDay } from "@/lib/date-range";
import type { EventType } from "@/lib/types";

type CreateEventOptions = {
  defaultEventTypeId?: string;
  defaultEventDate?: string;
};

type DashboardInteractionsContextValue = {
  selectedCalendarDate: Date;
  visibleCalendarMonth: Date;
  refreshKey: number;
  setSelectedCalendarDate: (date: Date) => void;
  setVisibleCalendarMonth: (month: Date) => void;
  openCreateModal: (options?: CreateEventOptions) => void;
};

const DashboardInteractionsContext = createContext<DashboardInteractionsContextValue | null>(null);

type DashboardInteractionsProviderProps = {
  athleteId: string;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  children: ReactNode;
};

export function DashboardInteractionsProvider({
  athleteId,
  eventTypes,
  eventTypesError,
  children,
}: DashboardInteractionsProviderProps) {
  const [selectedCalendarDate, setSelectedCalendarDateState] = useState(() =>
    startOfLocalDay(new Date()),
  );
  const [visibleCalendarMonth, setVisibleCalendarMonthState] = useState(() =>
    startOfLocalDay(new Date()),
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalState, setModalState] = useState<EventModalState>(null);
  const [formKey, setFormKey] = useState(0);

  const setSelectedCalendarDate = useCallback((date: Date) => {
    setSelectedCalendarDateState(startOfLocalDay(date));
  }, []);

  const setVisibleCalendarMonth = useCallback((month: Date) => {
    setVisibleCalendarMonthState(startOfLocalDay(month));
  }, []);

  const openCreateModal = useCallback((options?: CreateEventOptions) => {
    setModalState({
      mode: "create",
      defaultEventTypeId: options?.defaultEventTypeId,
      defaultEventDate: options?.defaultEventDate,
    });
    setFormKey((current) => current + 1);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeModal();
    setRefreshKey((current) => current + 1);
  }, [closeModal]);

  const value = useMemo(
    () => ({
      selectedCalendarDate,
      visibleCalendarMonth,
      refreshKey,
      setSelectedCalendarDate,
      setVisibleCalendarMonth,
      openCreateModal,
    }),
    [
      selectedCalendarDate,
      visibleCalendarMonth,
      refreshKey,
      setSelectedCalendarDate,
      setVisibleCalendarMonth,
      openCreateModal,
    ],
  );

  return (
    <DashboardInteractionsContext.Provider value={value}>
      {children}
      <EventFormModal
        athleteId={athleteId}
        eventTypes={eventTypes}
        eventTypesError={eventTypesError}
        modalState={modalState}
        formKey={formKey}
        onClose={closeModal}
        onSuccess={handleFormSuccess}
      />
    </DashboardInteractionsContext.Provider>
  );
}

export function useDashboardInteractions(): DashboardInteractionsContextValue {
  const context = useContext(DashboardInteractionsContext);

  if (!context) {
    throw new Error("useDashboardInteractions must be used within DashboardInteractionsProvider");
  }

  return context;
}
