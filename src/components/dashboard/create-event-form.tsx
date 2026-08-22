"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

import {
  createEventAction,
  updateEventAction,
  type DashboardActionState,
} from "@/app/dashboard/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { EventTypeMetricsSection } from "@/components/dashboard/event-metric-fields";
import { StrengthTrainingItemsSection } from "@/components/dashboard/event-items/strength-training-items-section";
import { DatePickerInput } from "@/components/date-picker-input";
import { DurationPartsFields } from "@/components/form/duration-parts-fields";
import { FormSelect } from "@/components/form/form-select";
import { OptionPills } from "@/components/form/option-pills";
import { TimePickerInput } from "@/components/time-picker-input";
import { groupEventTypes } from "@/lib/event-type-groups";
import {
  isStrengthTrainingEventType,
  type StrengthTrainingItemFormConfig,
} from "@/lib/event-item-form";
import { defaultCreateFormValues, eventToFormValues } from "@/lib/event-form-values";
import { EVENT_DURATION_FIELDS } from "@/lib/event-metric-form";
import { getZonedDateString, getZonedTimeString } from "@/lib/time-zone";
import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  getEventFormValidationError,
} from "@/lib/event-form-schema";
import type { Event, EventType, EventTypeMetricDefinition } from "@/lib/types";

const initialState: DashboardActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

const INTENSITY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
] as const;

export type EventFormApplyHandlers = {
  applyEventType: (eventTypeId: string) => void;
  applyDate: (eventDate: string) => void;
};

type EventFormProps = {
  athleteId: string;
  timeZone: string;
  eventTypes: EventType[];
  focusSportName: string;
  event?: Event;
  defaultEventTypeId?: string;
  defaultEventDate?: string;
  onApplyHandlersReady?: (handlers: EventFormApplyHandlers) => void;
  onSuccess?: () => void;
};

export function EventForm({
  athleteId,
  timeZone,
  eventTypes,
  focusSportName,
  event,
  defaultEventTypeId,
  defaultEventDate,
  onApplyHandlersReady,
  onSuccess,
}: EventFormProps) {
  const isEdit = event !== undefined;
  const isCreate = !isEdit;
  const [clientError, setClientError] = useState<string | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateEventAction : createEventAction,
    initialState,
  );

  const groups = useMemo(
    () => groupEventTypes(eventTypes, focusSportName),
    [eventTypes, focusSportName],
  );
  const values = useMemo(
    () =>
      event
        ? eventToFormValues(event, timeZone)
        : defaultCreateFormValues(
            defaultEventTypeId,
            defaultEventDate ?? getZonedDateString(timeZone),
            getZonedTimeString(timeZone),
          ),
    [event, timeZone, defaultEventTypeId, defaultEventDate],
  );
  const [eventTypeId, setEventTypeId] = useState(values.eventTypeId);
  const [eventDate, setEventDate] = useState(values.eventDate);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState(values.eventTypeId);
  const [metricMappings, setMetricMappings] = useState<EventTypeMetricDefinition[]>([]);
  const [metricFieldsLoading, setMetricFieldsLoading] = useState(Boolean(values.eventTypeId));
  const [metricFieldsLoadError, setMetricFieldsLoadError] = useState<string | null>(null);
  const [strengthItemConfig, setStrengthItemConfig] =
    useState<StrengthTrainingItemFormConfig | null>(null);
  const [strengthItemsLoading, setStrengthItemsLoading] = useState(false);
  const [metricFieldsResetKey, setMetricFieldsResetKey] = useState(values.eventTypeId || "initial");

  const handleEventTypeChange = useCallback((nextEventTypeId: string) => {
    setEventTypeId(nextEventTypeId);
    setSelectedEventTypeId((currentEventTypeId) => {
      if (currentEventTypeId === nextEventTypeId) {
        return currentEventTypeId;
      }

      setMetricFieldsResetKey(nextEventTypeId || "initial");
      setMetricMappings([]);
      setMetricFieldsLoading(Boolean(nextEventTypeId));
      setMetricFieldsLoadError(null);
      setStrengthItemConfig(null);
      setStrengthItemsLoading(false);

      return nextEventTypeId;
    });
  }, []);

  const applyDate = useCallback((nextEventDate: string) => {
    setEventDate(nextEventDate);
  }, []);

  useEffect(() => {
    if (!isCreate || !onApplyHandlersReady) {
      return;
    }

    onApplyHandlersReady({
      applyEventType: handleEventTypeChange,
      applyDate,
    });
  }, [applyDate, handleEventTypeChange, isCreate, onApplyHandlersReady]);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const selectedEventType = useMemo(
    () => eventTypes.find((eventType) => eventType.id === selectedEventTypeId),
    [eventTypes, selectedEventTypeId],
  );
  const showStrengthItems = isStrengthTrainingEventType(selectedEventType);
  const metricFieldsLoaded =
    selectedEventTypeId !== "" && !metricFieldsLoading && metricFieldsLoadError === null;
  const strengthItemsLoaded = showStrengthItems && !strengthItemsLoading && strengthItemConfig;

  const validateFormData = useCallback(
    (formData: FormData) => {
      if (selectedEventTypeId && metricFieldsLoading) {
        return "Metric fields are still loading. Try again in a moment.";
      }

      if (selectedEventTypeId && metricFieldsLoadError) {
        return "Metric fields could not be loaded for this event type.";
      }

      if (showStrengthItems && strengthItemsLoading) {
        return "Exercise fields are still loading. Try again in a moment.";
      }

      const strengthConfig = showStrengthItems ? strengthItemConfig : null;

      if (showStrengthItems && !strengthConfig) {
        return "Exercise fields could not be loaded for this event type.";
      }

      return getEventFormValidationError(formData, metricMappings, strengthConfig, {
        timeZone,
        requireEventId: isEdit,
      });
    },
    [
      isEdit,
      metricFieldsLoadError,
      metricFieldsLoading,
      metricMappings,
      selectedEventTypeId,
      showStrengthItems,
      strengthItemConfig,
      strengthItemsLoading,
      timeZone,
    ],
  );

  const syncValidationFromForm = useCallback(() => {
    if (!showValidationErrors || !formRef.current) {
      return;
    }

    setClientError(validateFormData(new FormData(formRef.current)));
  }, [showValidationErrors, validateFormData]);

  useEffect(() => {
    syncValidationFromForm();
  }, [
    eventTypeId,
    eventDate,
    metricFieldsLoadError,
    metricFieldsLoading,
    metricMappings,
    showStrengthItems,
    strengthItemConfig,
    strengthItemsLoading,
    syncValidationFromForm,
  ]);

  const handleSubmit = useCallback(
    (submitEvent: SubmitEvent<HTMLFormElement>) => {
      submitEvent.preventDefault();
      setShowValidationErrors(true);

      const formData = new FormData(submitEvent.currentTarget);
      const error = validateFormData(formData);

      if (error) {
        setClientError(error);
        return;
      }

      setClientError(null);

      startTransition(() => {
        formAction(formData);
      });
    },
    [formAction, validateFormData],
  );

  if (eventTypes.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No event types are available yet. Ask an admin to configure event types first.
      </p>
    );
  }

  return (
    <>
      <form
        ref={formRef}
        className="space-y-4"
        onInput={syncValidationFromForm}
        onChange={syncValidationFromForm}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="athleteId" value={athleteId} />
        <input type="hidden" name="eventTypeSlug" value={selectedEventType?.slug ?? ""} />
        {metricFieldsLoaded ? <input type="hidden" name="metricsLoaded" value="1" /> : null}
        {strengthItemsLoaded ? <input type="hidden" name="itemsLoaded" value="1" /> : null}
        {isEdit ? <input type="hidden" name="eventId" value={event.id} /> : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Event type</span>
          <FormSelect
            name="eventTypeId"
            placeholder="Select event type"
            className={inputClassName}
            {...(isCreate
              ? { value: eventTypeId, onValueChange: handleEventTypeChange }
              : { defaultValue: values.eventTypeId, onValueChange: handleEventTypeChange })}
            groups={groups.map((group) => ({
              label: group.label,
              options: group.items.map((eventType) => ({
                value: eventType.id,
                label: eventType.name,
              })),
            }))}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">Date</span>
            <DatePickerInput
              name="eventDate"
              {...(isCreate
                ? { value: eventDate, onChange: applyDate }
                : { defaultValue: values.eventDate, onChange: applyDate })}
              placeholder="Select date"
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-300">Start time</span>
            <TimePickerInput
              name="eventTime"
              defaultValue={values.eventTime}
              placeholder="Select time"
              className={inputClassName}
            />
            <span className="text-xs text-zinc-500">Leave empty to default to noon.</span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DurationPartsFields
            hoursName={EVENT_DURATION_FIELDS.hours}
            minutesName={EVENT_DURATION_FIELDS.minutes}
            secondsName={EVENT_DURATION_FIELDS.seconds}
            defaultHours={values.durationHours}
            defaultMinutes={values.durationMinutes}
            defaultSeconds={values.durationSeconds}
            label="Duration"
            inputClassName={inputClassName}
          />

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-300">Intensity</span>
            <OptionPills
              name="intensity"
              options={[...INTENSITY_OPTIONS]}
              defaultValue={values.intensity}
            />
          </div>
        </div>

        {selectedEventTypeId ? (
          <EventTypeMetricsSection
            key={selectedEventTypeId}
            eventTypeId={selectedEventTypeId}
            savedMetrics={
              isEdit && selectedEventTypeId === event.eventTypeId ? event.metrics : undefined
            }
            fieldsResetKey={`${metricFieldsResetKey}-${isEdit ? event.id : "create"}`}
            onMappingsChange={setMetricMappings}
            onLoadingChange={setMetricFieldsLoading}
            onLoadErrorChange={setMetricFieldsLoadError}
          />
        ) : null}

        {showStrengthItems ? (
          <StrengthTrainingItemsSection
            key={`${metricFieldsResetKey}-${isEdit ? event.id : "create"}-items`}
            eventTypeId={selectedEventTypeId}
            savedItems={
              isEdit && selectedEventTypeId === event.eventTypeId ? event.items : undefined
            }
            fieldsResetKey={`${metricFieldsResetKey}-${isEdit ? event.id : "create"}`}
            onConfigChange={setStrengthItemConfig}
            onLoadingChange={setStrengthItemsLoading}
          />
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Title</span>
          <input
            name="title"
            defaultValue={values.title}
            placeholder="Morning ice practice"
            className={inputClassName}
          />
          <span className="text-xs text-zinc-500">Max {EVENT_TITLE_MAX_LENGTH} characters</span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-300">Notes</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={values.description}
            placeholder="Edge work, small-area games, felt pretty hard."
            className={`${inputClassName} resize-y`}
          />
          <span className="text-xs text-zinc-500">
            Max {EVENT_DESCRIPTION_MAX_LENGTH} characters
          </span>
        </label>

        <div className="flex flex-col gap-3 pt-1">
          <FormMessage error={clientError ?? state.error} success={state.success} />
          <div className="flex sm:justify-end">
            <SubmitButton pending={isPending} pendingLabel={isEdit ? "Saving…" : "Adding…"}>
              {isEdit ? "Save changes" : "Add event"}
            </SubmitButton>
          </div>
        </div>
      </form>
    </>
  );
}
