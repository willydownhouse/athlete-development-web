export const CHAT_TYPEWRITER_CHARS_PER_FRAME = 3;

export function splitChatGraphemes(text: string): string[] {
  return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(
    (part) => part.segment,
  );
}

export function visibleChatTypewriterText(text: string, revealedCount: number): string {
  if (revealedCount <= 0) {
    return "";
  }

  const units = splitChatGraphemes(text);
  if (revealedCount >= units.length) {
    return text;
  }

  return units.slice(0, revealedCount).join("");
}

export function nextChatTypewriterCount(revealedCount: number, totalCount: number): number {
  return Math.min(totalCount, revealedCount + CHAT_TYPEWRITER_CHARS_PER_FRAME);
}

export function prefersReducedChatMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
