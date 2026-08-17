"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { EventFormApplyHandlers } from "@/components/dashboard/create-event-form";
import { EventFormModal } from "@/components/dashboard/event-form-modal";
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
  timeZone: string;
  eventTypes: EventType[];
  focusSportName: string;
  eventTypesError?: string | null;
  children: ReactNode;
};

export function DashboardInteractionsProvider({
  athleteId,
  timeZone,
  eventTypes,
  focusSportName,
  eventTypesError,
  children,
}: DashboardInteractionsProviderProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormMounted, setCreateFormMounted] = useState(false);
  const [createOptions, setCreateOptions] = useState<CreateEventOptions>({});
  const [formKey, setFormKey] = useState(0);
  const createFormMountedRef = useRef(false);
  const applyHandlersRef = useRef<EventFormApplyHandlers | null>(null);

  const handleApplyHandlersReady = useCallback((handlers: EventFormApplyHandlers) => {
    applyHandlersRef.current = handlers;
  }, []);

  const openCreateModal = useCallback((options?: CreateEventOptions) => {
    if (!createFormMountedRef.current) {
      setCreateOptions(options?.defaultEventTypeId ? options : {});
      setFormKey((current) => current + 1);
      setCreateFormMounted(true);
      createFormMountedRef.current = true;
    } else if (options?.defaultEventTypeId) {
      applyHandlersRef.current?.applyEventType(options.defaultEventTypeId);
    }

    setCreateModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setCreateModalOpen(false);
    setCreateFormMounted(false);
    createFormMountedRef.current = false;
    applyHandlersRef.current = null;
    setCreateOptions({});
    setFormKey((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      openCreateModal,
    }),
    [openCreateModal],
  );

  return (
    <DashboardInteractionsContext.Provider value={value}>
      {children}
      {createFormMounted ? (
        <EventFormModal
          open={createModalOpen}
          keepMounted
          athleteId={athleteId}
          timeZone={timeZone}
          eventTypes={eventTypes}
          focusSportName={focusSportName}
          eventTypesError={eventTypesError}
          modalState={{ mode: "create", ...createOptions }}
          formKey={formKey}
          onApplyHandlersReady={handleApplyHandlersReady}
          onClose={closeModal}
          onSuccess={handleFormSuccess}
        />
      ) : null}
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
