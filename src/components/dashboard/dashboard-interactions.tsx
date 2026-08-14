"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { EventFormModal, type EventModalState } from "@/components/dashboard/event-form-modal";
import type { EventType } from "@/lib/types";

type CreateEventOptions = {
  defaultEventTypeId?: string;
};

type DashboardInteractionsContextValue = {
  openCreateModal: (options?: CreateEventOptions) => void;
};

const DashboardInteractionsContext = createContext<DashboardInteractionsContextValue | null>(null);

type DashboardInteractionsProviderProps = {
  athleteId: string;
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
  children: ReactNode;
};

export function DashboardInteractionsProvider({
  athleteId,
  eventTypes,
  focusSportName,
  eventTypesError,
  children,
}: DashboardInteractionsProviderProps) {
  const [modalState, setModalState] = useState<EventModalState>(null);
  const [formKey, setFormKey] = useState(0);

  const openCreateModal = useCallback((options?: CreateEventOptions) => {
    setModalState({
      mode: "create",
      defaultEventTypeId: options?.defaultEventTypeId,
    });
    setFormKey((current) => current + 1);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const value = useMemo(
    () => ({
      openCreateModal,
    }),
    [openCreateModal],
  );

  return (
    <DashboardInteractionsContext.Provider value={value}>
      {children}
      <EventFormModal
        athleteId={athleteId}
        eventTypes={eventTypes}
        focusSportName={focusSportName}
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
