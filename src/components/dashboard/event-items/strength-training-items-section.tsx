"use client";

import { useEffect, useMemo, useState } from "react";

import { SetMetricFields } from "@/components/dashboard/event-items/set-metric-fields";
import {
  EVENT_ITEM_LABEL_MAX_LENGTH,
  STRENGTH_TRAINING_MAX_EXERCISES,
  eventItemsToStrengthFormValues,
  exerciseItemTypeIdFieldName,
  exerciseLabelFieldName,
  loadStrengthTrainingItemFormConfig,
  setItemTypeIdFieldName,
  type StrengthTrainingItemFormConfig,
} from "@/lib/event-item-form";
import type { EventItem } from "@/lib/types";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type ExerciseDraft = {
  key: string;
  label: string;
  sets: SetDraft[];
};

type SetDraft = {
  key: string;
  values: Record<string, string>;
};

type StrengthTrainingItemsSectionProps = {
  eventTypeId: string;
  savedItems?: EventItem[];
  fieldsResetKey: string;
  onConfigChange: (config: StrengthTrainingItemFormConfig | null) => void;
  onLoadingChange?: (loading: boolean) => void;
};

function createSetDraft(values: Record<string, string> = {}): SetDraft {
  return {
    key: crypto.randomUUID(),
    values,
  };
}

function createExerciseDraft(label = "", sets: SetDraft[] = [createSetDraft()]): ExerciseDraft {
  return {
    key: crypto.randomUUID(),
    label,
    sets,
  };
}

function buildExerciseDrafts(
  savedItems: EventItem[] | undefined,
  config: StrengthTrainingItemFormConfig,
): ExerciseDraft[] {
  const values = eventItemsToStrengthFormValues(
    savedItems,
    config.exerciseItemTypeId,
    config.setItemTypeId,
    config.setMetricMappings,
  );

  if (values.length === 0) {
    return [];
  }

  return values.map((exercise) =>
    createExerciseDraft(
      exercise.label,
      exercise.sets.map((setValues) => createSetDraft(setValues)),
    ),
  );
}

export function StrengthTrainingItemsSection({
  eventTypeId,
  savedItems,
  fieldsResetKey,
  onConfigChange,
  onLoadingChange,
}: StrengthTrainingItemsSectionProps) {
  const [config, setConfig] = useState<StrengthTrainingItemFormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);

  useEffect(() => {
    let cancelled = false;

    onLoadingChange?.(true);

    void loadStrengthTrainingItemFormConfig(eventTypeId)
      .then((loadedConfig) => {
        if (cancelled) {
          return;
        }

        setConfig(loadedConfig);
        onConfigChange(loadedConfig);

        if (loadedConfig) {
          setExercises(buildExerciseDrafts(savedItems, loadedConfig));
        } else {
          setExercises([]);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setConfig(null);
        onConfigChange(null);
        setExercises([]);
        setLoadError(error instanceof Error ? error.message : "Unable to load exercise fields");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      });

    return () => {
      cancelled = true;
      onLoadingChange?.(false);
    };
    // savedItems omitted intentionally — prefill on open/type change only, not on revalidation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypeId, fieldsResetKey, onConfigChange, onLoadingChange]);

  const canAddExercise = exercises.length < STRENGTH_TRAINING_MAX_EXERCISES;

  const sectionKey = useMemo(
    () => `${fieldsResetKey}-${config?.exerciseItemTypeId ?? "none"}`,
    [config?.exerciseItemTypeId, fieldsResetKey],
  );

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading exercises…</p>;
  }

  if (loadError) {
    return <p className="text-sm text-red-300">{loadError}</p>;
  }

  if (!config) {
    return null;
  }

  return (
    <div key={sectionKey} className="space-y-4 rounded-xl border border-white/10 bg-[#171b22] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-white">Exercises</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Add exercises and sets with reps, load, and RPE.
          </p>
        </div>
        {exercises.length === 0 && canAddExercise ? (
          <button
            type="button"
            onClick={() => setExercises((current) => [...current, createExerciseDraft()])}
            className="rounded-lg border border-white/10 bg-[#252b36] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-[#2f3642] hover:text-white"
          >
            Add exercise
          </button>
        ) : null}
      </div>

      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-500">No exercises added yet.</p>
      ) : (
        <div className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <div
              key={exercise.key}
              className="space-y-3 rounded-xl border border-white/10 bg-[#12161d] p-4"
            >
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <label className="flex min-w-0 w-full flex-col gap-1 text-sm sm:w-auto sm:flex-1">
                  <span className="mb-1 block font-medium text-zinc-300">Exercise</span>
                  <input
                    type="hidden"
                    name={exerciseItemTypeIdFieldName(exerciseIndex)}
                    value={config.exerciseItemTypeId}
                  />
                  <input
                    name={exerciseLabelFieldName(exerciseIndex)}
                    defaultValue={exercise.label}
                    placeholder="Curls"
                    className={inputClassName}
                  />
                  <span className="mt-1 text-xs text-zinc-500">
                    Max {EVENT_ITEM_LABEL_MAX_LENGTH} characters
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setExercises((current) => current.filter((item) => item.key !== exercise.key))
                  }
                  className="absolute right-0 top-0 text-sm font-medium text-red-300 transition hover:text-red-200 sm:static"
                >
                  Remove exercise
                </button>
              </div>

              <div className="space-y-3">
                {exercise.sets.map((setItem, setIndex) => (
                  <div
                    key={setItem.key}
                    className="space-y-3 rounded-xl border border-white/5 bg-[#171b22] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-zinc-300">Set {setIndex + 1}</p>
                      {exercise.sets.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExercises((current) =>
                              current.map((item) =>
                                item.key === exercise.key
                                  ? {
                                      ...item,
                                      sets: item.sets.filter((set) => set.key !== setItem.key),
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="text-xs font-medium text-red-300 transition hover:text-red-200"
                        >
                          Remove set
                        </button>
                      ) : null}
                    </div>
                    <input
                      type="hidden"
                      name={setItemTypeIdFieldName(exerciseIndex, setIndex)}
                      value={config.setItemTypeId}
                    />
                    <SetMetricFields
                      exerciseIndex={exerciseIndex}
                      setIndex={setIndex}
                      mappings={config.setMetricMappings}
                      defaultValues={setItem.values}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setExercises((current) =>
                    current.map((item) =>
                      item.key === exercise.key
                        ? { ...item, sets: [...item.sets, createSetDraft()] }
                        : item,
                    ),
                  )
                }
                className="text-sm font-medium text-[#9ec9e8] transition hover:text-[#b7d7ec]"
              >
                Add set
              </button>
            </div>
          ))}
        </div>
      )}

      {exercises.length > 0 && canAddExercise ? (
        <button
          type="button"
          onClick={() => setExercises((current) => [...current, createExerciseDraft()])}
          className="w-full rounded-lg border border-white/10 bg-[#252b36] px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-[#2f3642] hover:text-white"
        >
          Add exercise
        </button>
      ) : null}
    </div>
  );
}
