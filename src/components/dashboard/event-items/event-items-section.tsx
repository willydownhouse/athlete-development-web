"use client";

import { useEffect, useMemo, useState } from "react";

import { ItemMetricFields } from "@/components/dashboard/event-items/item-metric-fields";
import { DurationPartsFields } from "@/components/form/duration-parts-fields";
import { FormSectionDetails } from "@/components/form/form-section-details";
import {
  EVENT_ITEM_LABEL_MAX_LENGTH,
  EVENT_ITEMS_MAX_ROOT_ITEMS,
  EVENT_ITEMS_MAX_TOTAL,
  eventItemFormSectionTitle,
  eventItemsToFormDrafts,
  findItemFormTypeNode,
  itemDurationFieldNames,
  itemFieldName,
  loadEventItemFormCatalog,
  type EventItemFormCatalog,
  type EventItemFormDraft,
  type EventItemFormPath,
  type EventItemFormTypeNode,
} from "@/lib/event-item-form";
import type { EventItem } from "@/lib/types";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type EventItemsSectionProps = {
  eventTypeId: string;
  savedItems?: EventItem[];
  fieldsResetKey: string;
  onCatalogChange: (catalog: EventItemFormCatalog | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  onLoadErrorChange?: (error: string | null) => void;
};

function createItemDraft(typeNode: EventItemFormTypeNode): EventItemFormDraft {
  return {
    key: crypto.randomUUID(),
    eventItemTypeId: typeNode.eventItemTypeId,
    label: "",
    durationHours: "",
    durationMinutes: "",
    durationSeconds: "",
    metricValues: {},
    notes: "",
    startedAt: "",
    endedAt: "",
    structuredData: "",
    children: [],
  };
}

function countDrafts(items: EventItemFormDraft[]): number {
  return items.reduce((total, item) => total + 1 + countDrafts(item.children), 0);
}

function sameTypeIndex(siblings: EventItemFormDraft[], index: number): number {
  const typeId = siblings[index]?.eventItemTypeId;

  if (!typeId) {
    return 1;
  }

  return siblings.slice(0, index + 1).filter((sibling) => sibling.eventItemTypeId === typeId)
    .length;
}

function updateDraftsAt(
  items: EventItemFormDraft[],
  path: EventItemFormPath,
  updater: (siblings: EventItemFormDraft[]) => EventItemFormDraft[],
): EventItemFormDraft[] {
  if (path.length === 0) {
    return updater(items);
  }

  const [index, ...rest] = path;

  return items.map((item, itemIndex) =>
    itemIndex === index
      ? {
          ...item,
          children: updateDraftsAt(item.children, rest, updater),
        }
      : item,
  );
}

function AddTypeButtons({
  types,
  disabled,
  onAdd,
}: {
  types: EventItemFormTypeNode[];
  disabled: boolean;
  onAdd: (typeNode: EventItemFormTypeNode) => void;
}) {
  if (types.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {types.map((typeNode) => (
        <button
          key={typeNode.eventItemTypeId}
          type="button"
          disabled={disabled}
          onClick={() => onAdd(typeNode)}
          className="text-sm font-medium text-[#9ec9e8] transition hover:text-[#b7d7ec] disabled:cursor-not-allowed disabled:text-zinc-500"
        >
          Add {typeNode.name.toLowerCase()}
        </button>
      ))}
    </div>
  );
}

function EventItemNode({
  item,
  siblings,
  index,
  path,
  catalog,
  allowedTypes,
  canAddMore,
  onItemsChange,
}: {
  item: EventItemFormDraft;
  siblings: EventItemFormDraft[];
  index: number;
  path: EventItemFormPath;
  catalog: EventItemFormCatalog;
  allowedTypes: EventItemFormTypeNode[];
  canAddMore: boolean;
  onItemsChange: (updater: (current: EventItemFormDraft[]) => EventItemFormDraft[]) => void;
}) {
  const typeNode =
    allowedTypes.find((node) => node.eventItemTypeId === item.eventItemTypeId) ??
    findItemFormTypeNode(catalog.roots, item.eventItemTypeId);
  const typeName = typeNode?.name ?? "Item";
  const durationFields = itemDurationFieldNames(path);
  const childTypes = typeNode?.children ?? [];
  const parentPath = path.slice(0, -1);

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[#12161d] p-4">
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <label className="flex min-w-0 w-full flex-col gap-1 text-sm sm:w-auto sm:flex-1">
          <span className="mb-1 block font-medium text-zinc-300">
            {typeName} {sameTypeIndex(siblings, index)}
          </span>
          {item.id ? (
            <input type="hidden" name={itemFieldName(path, "id")} value={item.id} />
          ) : null}
          <input
            type="hidden"
            name={itemFieldName(path, "eventItemTypeId")}
            value={item.eventItemTypeId}
          />
          {item.notes ? (
            <input type="hidden" name={itemFieldName(path, "notes")} value={item.notes} />
          ) : null}
          {item.startedAt ? (
            <input type="hidden" name={itemFieldName(path, "startedAt")} value={item.startedAt} />
          ) : null}
          {item.endedAt ? (
            <input type="hidden" name={itemFieldName(path, "endedAt")} value={item.endedAt} />
          ) : null}
          {item.structuredData ? (
            <input
              type="hidden"
              name={itemFieldName(path, "structuredData")}
              value={item.structuredData}
            />
          ) : null}
          <input
            name={itemFieldName(path, "label")}
            defaultValue={item.label}
            placeholder={typeName}
            className={inputClassName}
          />
          <span className="mt-1 text-xs text-zinc-500">
            Max {EVENT_ITEM_LABEL_MAX_LENGTH} characters
          </span>
        </label>
        <button
          type="button"
          onClick={() =>
            onItemsChange((current) =>
              updateDraftsAt(current, parentPath, (currentSiblings) =>
                currentSiblings.filter((_, siblingIndex) => siblingIndex !== index),
              ),
            )
          }
          className="absolute right-0 top-0 text-sm font-medium text-red-300 transition hover:text-red-200 sm:static"
        >
          Remove {typeName.toLowerCase()}
        </button>
      </div>

      <DurationPartsFields
        hoursName={durationFields.hours}
        minutesName={durationFields.minutes}
        secondsName={durationFields.seconds}
        defaultHours={item.durationHours}
        defaultMinutes={item.durationMinutes}
        defaultSeconds={item.durationSeconds}
        label="Duration"
        inputClassName={inputClassName}
      />

      {typeNode ? (
        <ItemMetricFields
          path={path}
          mappings={typeNode.metrics}
          defaultValues={item.metricValues}
        />
      ) : null}

      {item.children.length > 0 ? (
        <div className="space-y-3 border-t border-white/5 pt-3">
          {item.children.map((child, childIndex) => (
            <EventItemNode
              key={child.key}
              item={child}
              siblings={item.children}
              index={childIndex}
              path={[...path, childIndex]}
              catalog={catalog}
              allowedTypes={childTypes}
              canAddMore={canAddMore}
              onItemsChange={onItemsChange}
            />
          ))}
        </div>
      ) : null}

      <AddTypeButtons
        types={childTypes}
        disabled={!canAddMore}
        onAdd={(childType) =>
          onItemsChange((current) =>
            updateDraftsAt(current, parentPath, (currentSiblings) =>
              currentSiblings.map((sibling, siblingIndex) =>
                siblingIndex === index
                  ? { ...sibling, children: [...sibling.children, createItemDraft(childType)] }
                  : sibling,
              ),
            ),
          )
        }
      />
    </div>
  );
}

export function EventItemsSection({
  eventTypeId,
  savedItems,
  fieldsResetKey,
  onCatalogChange,
  onLoadingChange,
  onLoadErrorChange,
}: EventItemsSectionProps) {
  const [catalog, setCatalog] = useState<EventItemFormCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [items, setItems] = useState<EventItemFormDraft[]>([]);

  useEffect(() => {
    let cancelled = false;

    onLoadingChange?.(true);
    onLoadErrorChange?.(null);

    void loadEventItemFormCatalog(eventTypeId)
      .then((loadedCatalog) => {
        if (cancelled) {
          return;
        }

        setCatalog(loadedCatalog);
        onCatalogChange(loadedCatalog);
        setLoadError(null);
        onLoadErrorChange?.(null);
        setItems(eventItemsToFormDrafts(savedItems, loadedCatalog));
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load item fields";
        setCatalog(null);
        onCatalogChange(null);
        setItems([]);
        setLoadError(message);
        onLoadErrorChange?.(message);
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
  }, [eventTypeId, fieldsResetKey, onCatalogChange, onLoadErrorChange, onLoadingChange]);

  const sectionKey = useMemo(
    () =>
      `${fieldsResetKey}-${catalog?.roots.map((root) => root.eventItemTypeId).join("-") ?? "none"}`,
    [catalog, fieldsResetKey],
  );
  const sectionTitle = eventItemFormSectionTitle(catalog?.roots ?? []);
  const canAddRoot = items.length < EVENT_ITEMS_MAX_ROOT_ITEMS;
  const canAddMore = canAddRoot && countDrafts(items) < EVENT_ITEMS_MAX_TOTAL;

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading item fields…</p>;
  }

  if (loadError) {
    return <p className="text-sm text-red-300">{loadError}</p>;
  }

  if (!catalog || catalog.roots.length === 0) {
    return null;
  }

  return (
    <div key={sectionKey} className="rounded-xl border border-white/10 bg-[#171b22] p-4">
      <FormSectionDetails
        title={sectionTitle}
        description="Optional nested details configured for this event type."
      >
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">No {sectionTitle.toLowerCase()} added yet.</p>
              <AddTypeButtons
                types={catalog.roots}
                disabled={!canAddMore}
                onAdd={(typeNode) => {
                  setItems((current) => [...current, createItemDraft(typeNode)]);
                }}
              />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <EventItemNode
                    key={item.key}
                    item={item}
                    siblings={items}
                    index={index}
                    path={[index]}
                    catalog={catalog}
                    allowedTypes={catalog.roots}
                    canAddMore={canAddMore}
                    onItemsChange={setItems}
                  />
                ))}
              </div>
              <AddTypeButtons
                types={catalog.roots}
                disabled={!canAddMore}
                onAdd={(typeNode) => {
                  setItems((current) => [...current, createItemDraft(typeNode)]);
                }}
              />
            </>
          )}
        </div>
      </FormSectionDetails>
    </div>
  );
}
