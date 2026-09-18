import { useEffect, useLayoutEffect, type RefObject } from "react";

function listboxOptionElements(list: HTMLElement | null): HTMLButtonElement[] {
  if (!list) {
    return [];
  }

  return [...list.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)')];
}

export function nextListboxIndex(
  count: number,
  currentIndex: number,
  key: "ArrowDown" | "ArrowUp" | "Home" | "End",
): number {
  if (count === 0) {
    return -1;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return count - 1;
  }

  if (key === "ArrowDown") {
    if (currentIndex < 0) {
      return 0;
    }

    return Math.min(count - 1, currentIndex + 1);
  }

  if (currentIndex < 0) {
    return count - 1;
  }

  return Math.max(0, currentIndex - 1);
}

export function useListboxKeyboard({
  open,
  listRef,
  triggerRef,
  onClose,
}: {
  open: boolean;
  listRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const options = listboxOptionElements(listRef.current);
    const selected = options.find((option) => option.getAttribute("aria-selected") === "true");
    (selected ?? options[0])?.focus();
  }, [listRef, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        triggerRef.current?.focus();
        return;
      }

      if (event.key === "Tab") {
        // Focus the trigger so Tab/Shift+Tab continues from its place in the
        // page order. Options are portaled and tabindex=-1, so leaving focus
        // on them would skip past the surrounding controls.
        triggerRef.current?.focus();
        onClose();
        return;
      }

      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      const options = listboxOptionElements(listRef.current);

      if (options.length === 0) {
        return;
      }

      event.preventDefault();
      const currentIndex = options.findIndex((option) => option === document.activeElement);
      const nextIndex = nextListboxIndex(options.length, currentIndex, event.key);
      options[nextIndex]?.focus();
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [listRef, onClose, open, triggerRef]);
}
