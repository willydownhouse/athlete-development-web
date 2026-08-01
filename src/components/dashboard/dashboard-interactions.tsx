"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { EventFormModal, type EventModalState } from "@/components/dashboard/event-form-modal";
import { startOfLocalDay } from "@/lib/date-range";
import type { Event, EventType } from "@/lib/types";

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
  focusCalendarDate: (date: Date) => void;
  openCreateModal: (options?: CreateEventOptions) => void;
  openEditModal: (event: Event) => void;
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
  const router = useRouter();
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

  const focusCalendarDate = useCallback(
    (date: Date) => {
      const nextDate = startOfLocalDay(date);
      setSelectedCalendarDateState(nextDate);
      setVisibleCalendarMonthState(nextDate);
      document.getElementById("calendar-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [],
  );

  const openCreateModal = useCallback((options?: CreateEventOptions) => {
    setModalState({
      mode: "create",
      defaultEventTypeId: options?.defaultEventTypeId,
      defaultEventDate: options?.defaultEventDate,
    });
    setFormKey((current) => current + 1);
  }, []);

  const openEditModal = useCallback((event: Event) => {
    setModalState({ mode: "edit", event });
    setFormKey((current) => current + 1);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeModal();
    setRefreshKey((current) => current + 1);
    router.refresh();
  }, [closeModal, router]);

  const value = useMemo(
    () => ({
      selectedCalendarDate,
      visibleCalendarMonth,
      refreshKey,
      setSelectedCalendarDate,
      setVisibleCalendarMonth,
      focusCalendarDate,
      openCreateModal,
      openEditModal,
    }),
    [
      selectedCalendarDate,
      visibleCalendarMonth,
      refreshKey,
      setSelectedCalendarDate,
      setVisibleCalendarMonth,
      focusCalendarDate,
      openCreateModal,
      openEditModal,
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
